import React, { useState, useEffect } from 'react'
import { useWizard } from '../../context/WizardProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Trash2, Target, Calendar, DollarSign, Eye, EyeOff } from 'lucide-react'
import { axiosInstance } from '@/lib/axios'
import { toast } from 'sonner'
import { WizardGoal } from '../../types/wizard.types'

interface Goal {
  goal_id: string
  title: string
  description: string
  goal_amount: string  // Changed to string to match API
  goal_type: 'monthly' | 'custom'
  start_date: string
  end_date: string
  is_visible: boolean
  is_featured: boolean
  status: 'active' | 'completed' | 'cancelled'
  current_amount: string  // Changed to string to match API
}

export default function GoalsStep() {
  const { state, actions } = useWizard()
  const { account } = state.formData
  
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Form state for new/edit goal
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    goal_amount: '',
    end_date: '',
    is_visible: true
  })

  const isNonProfit = account.account_type === 'npo'
  const isInfluencer = account.account_type === 'influencer'

  // Calculate minimum date (1 week from now for NPOs)
  const getMinDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split('T')[0]
  }

  // Fetch active goals
  const fetchActiveGoals = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get('/api/accounts/goals?active_only=true')
      const goals = response.data || []  // Changed: your API returns array directly, not wrapped in goals
      const activeGoal = goals.find((goal: Goal) => goal.status === 'active')
      setActiveGoal(activeGoal || null)
      
      // If editing existing goal, populate form
      if (activeGoal) {
        setGoalForm({
          title: activeGoal.title,
          description: activeGoal.description,
          goal_amount: activeGoal.goal_amount.toString(),
          end_date: activeGoal.end_date.split('T')[0],
          is_visible: activeGoal.is_visible
        })
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveGoals()
  }, [])

  // Update wizard form data when activeGoal changes - FIXED: removed useCallback
  useEffect(() => {
    if (activeGoal) {
      const wizardGoal: WizardGoal = {
        id: activeGoal.goal_id,
        title: activeGoal.title,
        description: activeGoal.description,
        goal_amount: parseFloat(activeGoal.goal_amount),
        current_amount: parseFloat(activeGoal.current_amount) || 0,
        progress_percentage: activeGoal.current_amount ? (parseFloat(activeGoal.current_amount) / parseFloat(activeGoal.goal_amount)) * 100 : 0,
        start_date: activeGoal.start_date,
        end_date: activeGoal.end_date,
        goal_type: activeGoal.goal_type,
        status: activeGoal.status,
        is_visible: activeGoal.is_visible,
        is_featured: activeGoal.is_featured
      }
      actions.updateFormData({ goal: wizardGoal })
    } else {
      actions.updateFormData({ goal: undefined })
    }
  }, [activeGoal]) // Removed actions from dependencies

  const handleInputChange = (field: string, value: string | boolean) => {
    setGoalForm(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!goalForm.title.trim()) {
      toast.error('Goal title is required')
      return false
    }
    if (!goalForm.description.trim()) {
      toast.error('Goal description is required')
      return false
    }
    if (!goalForm.goal_amount || parseFloat(goalForm.goal_amount) <= 0) {
      toast.error('Goal amount must be greater than 0')
      return false
    }
    if (isNonProfit && !goalForm.end_date) {
      toast.error('End date is required for custom goals')
      return false
    }
    return true
  }

  const handleCreateOrUpdateGoal = async () => {
    if (!validateForm()) return

    try {
      setIsSaving(true)
      
      const goalData = {
        title: goalForm.title,
        description: goalForm.description,
        goal_amount: parseFloat(goalForm.goal_amount),
        goal_type: isNonProfit ? 'custom' : 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: isNonProfit ? goalForm.end_date : (() => {
          const date = new Date()
          date.setMonth(date.getMonth() + 1)
          return date.toISOString().split('T')[0]
        })(),
        is_visible: goalForm.is_visible,
        is_featured: false
      }

      if (activeGoal) {
        // Update existing goal
        await axiosInstance.put(`/api/accounts/goals/${activeGoal.goal_id}`, {
          title: goalData.title,
          description: goalData.description,
          goal_amount: goalData.goal_amount,
          is_visible: goalData.is_visible
        })
        toast.success('Goal updated successfully!')
      } else {
        // Create new goal
        await axiosInstance.post('/api/accounts/goals', goalData)
        toast.success('Goal created successfully!')
      }
      
      await fetchActiveGoals()
    } catch (error: any) {
      console.error('Failed to save goal:', error)
      if (error.response?.status === 409) {
        toast.error('You already have an active goal. Please complete or cancel it first.')
      } else {
        toast.error('Failed to save goal')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGoal = async () => {
    if (!activeGoal) return

    try {
      setIsDeleting(true)
      await axiosInstance.delete(`/api/accounts/goals/${activeGoal.goal_id}`)
      toast.success('Goal deleted successfully!')
      setActiveGoal(null)
      setGoalForm({
        title: '',
        description: '',
        goal_amount: '',
        end_date: '',
        is_visible: true
      })
    } catch (error) {
      console.error('Failed to delete goal:', error)
      toast.error('Failed to delete goal')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleVisibility = async () => {
    if (!activeGoal) return

    try {
      const newVisibility = !activeGoal.is_visible
      await axiosInstance.put(`/api/accounts/goals/${activeGoal.goal_id}`, {
        is_visible: newVisibility
      })
      setActiveGoal(prev => prev ? { ...prev, is_visible: newVisibility } : null)
      setGoalForm(prev => ({ ...prev, is_visible: newVisibility }))
      toast.success(`Goal ${newVisibility ? 'shown' : 'hidden'} on profile`)
    } catch (error) {
      console.error('Failed to toggle visibility:', error)
      toast.error('Failed to update visibility')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isNonProfit ? 'Fundraising Goal' : 'Monthly Goal'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isNonProfit 
            ? 'Set up a fundraising goal for your cause and track progress toward your mission'
            : 'Set a monthly support goal to track your growth and engage your community'
          }
        </p>
      </div>

      {/* Existing Goal Display */}
      {activeGoal && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Current Goal</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleVisibility}
                className="text-blue-600 hover:text-blue-700"
              >
                {activeGoal.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {activeGoal.is_visible ? 'Visible' : 'Hidden'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteGoal}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">{activeGoal.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{activeGoal.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Goal: ${activeGoal.goal_amount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Ends: {new Date(activeGoal.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Goal Form */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-gray-800 dark:text-gray-200 font-medium">
            {activeGoal ? 'Update Goal' : 'Create Goal'}
          </Label>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="goal-title" className="text-sm text-gray-700 dark:text-gray-300">
              Goal Title
            </Label>
            <Input
              id="goal-title"
              value={goalForm.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={isNonProfit ? 'Help fund our community garden' : 'Monthly supporter goal'}
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="goal-description" className="text-sm text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="goal-description"
              value={goalForm.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={isNonProfit 
                ? 'Describe your cause and how the funds will be used...' 
                : 'Share what this monthly goal means to you and your community...'
              }
              rows={3}
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 resize-none"
            />
          </div>

          {/* Goal Amount */}
          <div className="space-y-2">
            <Label htmlFor="goal-amount" className="text-sm text-gray-700 dark:text-gray-300">
              Goal Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="goal-amount"
                type="number"
                min="1"
                step="0.01"
                value={goalForm.goal_amount}
                onChange={(e) => handleInputChange('goal_amount', e.target.value)}
                placeholder="1000"
                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 pl-8"
              />
            </div>
          </div>

          {/* End Date (NPO only) */}
          {isNonProfit && (
            <div className="space-y-2">
              <Label htmlFor="goal-end-date" className="text-sm text-gray-700 dark:text-gray-300">
                End Date
              </Label>
              <Input
                id="goal-end-date"
                type="date"
                min={getMinDate()}
                value={goalForm.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
              <p className="text-xs text-gray-500">
                Must be at least 1 week from today
              </p>
            </div>
          )}

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">
                Show on Profile
              </Label>
              <p className="text-xs text-gray-500">
                Make this goal visible to your supporters
              </p>
            </div>
            <Switch
              checked={goalForm.is_visible}
              onCheckedChange={(checked) => handleInputChange('is_visible', checked)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCreateOrUpdateGoal}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {activeGoal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {isNonProfit ? (
            <>
              💡 <strong>Tip:</strong> Custom goals are perfect for specific fundraising campaigns. 
              Set a clear end date and describe exactly how the funds will be used to build trust with supporters.
            </>
          ) : (
            <>
              💡 <strong>Tip:</strong> Monthly goals automatically reset each month and help track your 
              recurring support growth. This creates a sense of community momentum!
            </>
          )}
        </p>
      </div>
    </div>
  )
}
