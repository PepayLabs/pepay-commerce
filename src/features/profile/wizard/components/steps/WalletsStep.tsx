import React, { useState, useEffect } from 'react'
import { useWizard } from '../../context/WizardProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, Trash2, Plus, Info, AlertTriangle } from 'lucide-react'
import { profileWalletApi } from '../../api/profileWalletApi'
import { toast } from 'sonner'

interface WalletData {
  id: string
  address: string
  type: string
  is_active: boolean
  created_at: string
}

interface NetworkWallets {
  network: string
  wallets: WalletData[]
}

const SUPPORTED_NETWORKS = [
  { id: 'bsc', name: 'BNB Chain', symbol: 'BNB' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB' },
  { id: 'base', name: 'Base', symbol: 'BASE' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'sui', name: 'Sui', symbol: 'SUI' },
  { id: 'aptos', name: 'Aptos', symbol: 'APT' },
]

export default function WalletsStep() {
  const { state } = useWizard()
  const [networkWallets, setNetworkWallets] = useState<NetworkWallets[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [newAddresses, setNewAddresses] = useState<Record<string, string>>({})

  useEffect(() => {
    loadWallets()
  }, [])

  const loadWallets = async () => {
    try {
      setIsLoading(true)
      const wallets = await profileWalletApi.getAccountWallets()
      setNetworkWallets(wallets)
    } catch (error) {
      console.error('Failed to load wallets:', error)
      toast.error('Failed to load wallets')
    } finally {
      setIsLoading(false)
    }
  }

  const getNonCustodialWallet = (network: string): WalletData | null => {
    const networkData = networkWallets.find(nw => nw.network.toLowerCase() === network.toLowerCase())
    return networkData?.wallets.find(w => w.type === 'non-custodial') || null
  }

  const hasCustodialWallet = (network: string): boolean => {
    const networkData = networkWallets.find(nw => nw.network.toLowerCase() === network.toLowerCase())
    return networkData?.wallets.some(w => w.type === 'custodial') || false
  }

  const isNetworkAvailable = (network: string): boolean => {
    return networkWallets.some(nw => nw.network.toLowerCase() === network.toLowerCase())
  }

  const handleAddressChange = (network: string, address: string) => {
    setNewAddresses(prev => ({
      ...prev,
      [network]: address
    }))
  }

  const handleAddWallet = async (network: string) => {
    const address = newAddresses[network]?.trim()
    if (!address) return

    try {
      setIsAdding(network)
      await profileWalletApi.addNonCustodialWallet(network, address)
      
      // Clear the input
      setNewAddresses(prev => ({
        ...prev,
        [network]: ''
      }))
      
      // Reload wallets
      await loadWallets()
      toast.success(`${SUPPORTED_NETWORKS.find(n => n.id === network)?.name} wallet added successfully`)
    } catch (error: any) {
      console.error('Failed to add wallet:', error)
      toast.error(error.response?.data?.error || 'Failed to add wallet')
    } finally {
      setIsAdding(null)
    }
  }

  const handleDeleteWallet = async (walletId: string, network: string) => {
    try {
      setIsDeleting(walletId)
      await profileWalletApi.deleteWallet(walletId)
      
      // Reload wallets
      await loadWallets()
      toast.success(`${SUPPORTED_NETWORKS.find(n => n.id === network)?.name} wallet deleted successfully`)
    } catch (error: any) {
      console.error('Failed to delete wallet:', error)
      toast.error(error.response?.data?.error || 'Failed to delete wallet')
    } finally {
      setIsDeleting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading wallets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
          <Wallet className="w-6 h-6" />
          Wallet Setup
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your non-custodial wallets for receiving support funds
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Important:</strong> To receive support funds directly in your non-custodial wallet, please provide wallet addresses below. 
          If you prefer to use custodial wallets, go to the Wallets tab to retrieve your private keys and import them into your local wallet.
        </AlertDescription>
      </Alert>

      {/* Network Wallets */}
      <div className="space-y-4">
        {SUPPORTED_NETWORKS.filter(network => isNetworkAvailable(network.id)).map((network) => {
          const nonCustodialWallet = getNonCustodialWallet(network.id)
          const hasCustodial = hasCustodialWallet(network.id)

          return (
            <div key={network.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                      {network.name} ({network.symbol})
                    </h3>
                    {hasCustodial && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Custodial wallet available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {nonCustodialWallet ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-700 dark:text-gray-300">
                      Non-Custodial Address
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={nonCustodialWallet.address}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWallet(nonCustodialWallet.id, network.id)}
                        disabled={isDeleting === nonCustodialWallet.id}
                        className="shrink-0"
                      >
                        {isDeleting === nonCustodialWallet.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Active - Funds will be sent to this address
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-700 dark:text-gray-300">
                      Add Non-Custodial Address
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder={`Enter your ${network.name} address`}
                        value={newAddresses[network.id] || ''}
                        onChange={(e) => handleAddressChange(network.id, e.target.value)}
                        className="font-mono text-sm"
                      />
                      <Button
                        onClick={() => handleAddWallet(network.id)}
                        disabled={isAdding === network.id || !newAddresses[network.id]?.trim()}
                        className="shrink-0"
                      >
                        {isAdding === network.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Add
                      </Button>
                    </div>
                  </div>

                  {hasCustodial && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Currently using custodial wallet - add non-custodial for direct control
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Show message if no networks are available */}
      {networkWallets.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No wallet networks available yet.</p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
        <p>Non-custodial wallets give you full control of your funds</p>
        <p>Make sure you control the private keys for any addresses you add</p>
      </div>
    </div>
  )
}