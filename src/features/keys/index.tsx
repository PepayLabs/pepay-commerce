import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/auth'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from 'uuid'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface MerchantApiKey {
    key_id: string;
    name: string;
    expires_at: string;
    last_used_at: string | null;
    created_at: string;
}

interface CreateKeyRequest {
    name: string;
    expires_at: string;
}

interface CreateKeyResponse {
    key_id: string;
    name: string;
    api_key: string;
    expires_at: string;
}

export default function Keys() {
    const [apiKeys, setApiKeys] = useState<MerchantApiKey[]>([])
    const [loadingKeys, setLoadingKeys] = useState(false)
    const token = auth.getToken()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newApiKey, setNewApiKey] = useState<CreateKeyRequest>({
        name: '',
        expires_at: ''
    })
    const [createdKey, setCreatedKey] = useState<CreateKeyResponse | null>(null)
    const fetchApiKeys = async () => {
        setLoadingKeys(true)
        try {
            const response = await fetch('https://api.pepay.io/api/merchant-api-keys', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch API keys')
            }

            const data = await response.json()
            setApiKeys(Array.isArray(data) ? data : data.keys || [])
        } catch (error) {
            console.error('Error fetching API keys:', error)
            setApiKeys([])
            auth.logout()
            window.location.href = '/' // Redirect to login page
        } finally {
            setLoadingKeys(false)
        }
    }

    const handleRevokeKey = async (keyId: string) => {
        try {
            const response = await fetch(`https://api.pepay.io/api/merchant-api-keys/${keyId}/revoke`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error('Failed to revoke API key')
            }

            toast.success('API key revoked successfully')
            fetchApiKeys()
        } catch (error) {
            console.error('Error revoking API key:', error)
            toast.error('Failed to revoke API key')
        }
    }

    const calculateExpiryDate = (duration: string) => {
        const now = new Date()
        switch (duration) {
            case '1week':
                now.setDate(now.getDate() + 7)
                break
            case '1month':
                now.setMonth(now.getMonth() + 1)
                break
            case '3months':
                now.setMonth(now.getMonth() + 3)
                break
            case '6months':
                now.setMonth(now.getMonth() + 6)
                break
            case '9months':
                now.setMonth(now.getMonth() + 9)
                break
            case '1year':
                now.setFullYear(now.getFullYear() + 1)
                break
            case '2years':
                now.setFullYear(now.getFullYear() + 2)
                break
            case '3years':
                now.setFullYear(now.getFullYear() + 3)
                break
        }
        return now.toISOString()
    }

    const handleCreateKey = async () => {
        setIsCreating(true)
        try {
            const idempotencyKey = uuidv4()
            const response = await fetch('https://api.pepay.io/api/merchant-api-keys', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Idempotency-Key': idempotencyKey,
                },
                body: JSON.stringify(newApiKey),
            })

            if (!response.ok) {
                throw new Error('Failed to create API key')
            }

            const data: CreateKeyResponse = await response.json()
            setCreatedKey(data)
            fetchApiKeys()
            toast.success('API key created successfully')
        } catch (error) {
            console.error('Error creating API key:', error)
            toast.error('Failed to create API key')
        } finally {
            setIsCreating(false)
        }
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setCreatedKey(null)
        setNewApiKey({
            name: '',
            expires_at: ''
        })
    }

    useEffect(() => {
        if (token) {
            fetchApiKeys()
        }
    }, [token])

    return (
        <>
            <Header>
                <Search />
                <div className='ml-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main fixed>
                <div className='flex justify-between items-center'>
                    <div className='space-y-0.5'>
                        <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                            API Keys
                        </h1>
                    </div>
                    <Dialog
                        open={isModalOpen}
                        onOpenChange={(open) => {
                            setIsModalOpen(open);
                            if (!open) {
                                handleModalClose();
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsModalOpen(true)}>
                                Add Key
                            </Button>
                        </DialogTrigger>
                        <DialogContent onPointerDownOutside={(e) => {
                            e.preventDefault()
                        }}>
                            <DialogHeader>
                                <DialogTitle>
                                    {createdKey ? 'API Key Created' : 'Create New API Key'}
                                </DialogTitle>
                            </DialogHeader>
                            {createdKey ? (
                                <div className="grid gap-4 py-4">
                                    <div className="text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-2">
                                        ⚠️ Important: Please copy your API key now. For security reasons, it will only be shown once.
                                    </div>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <div className="flex flex-col gap-3">
                                            <div className="text-sm font-medium">API Key:</div>
                                            <div className="bg-background p-3 rounded-lg break-all border">
                                                <code className="text-sm">{createdKey.api_key}</code>
                                            </div>
                                            <Button
                                                className="w-full bg-primary hover:bg-primary/90"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(createdKey.api_key)
                                                    toast.success('API key copied to clipboard')
                                                }}
                                            >
                                                <span className="mr-2">📋</span>
                                                Copy API Key
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleModalClose}
                                        className="mt-2"
                                    >
                                        Close
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Key Name</Label>
                                        <Input
                                            id="name"
                                            value={newApiKey.name}
                                            onChange={(e) => setNewApiKey(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))}
                                            placeholder="Production API Key"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="expires">Expiration</Label>
                                        <Select
                                            onValueChange={(value) => setNewApiKey(prev => ({
                                                ...prev,
                                                expires_at: calculateExpiryDate(value)
                                            }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select expiration time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1week">1 Week</SelectItem>
                                                <SelectItem value="1month">1 Month</SelectItem>
                                                <SelectItem value="3months">3 Months</SelectItem>
                                                <SelectItem value="6months">6 Months</SelectItem>
                                                <SelectItem value="9months">9 Months</SelectItem>
                                                <SelectItem value="1year">1 Year</SelectItem>
                                                <SelectItem value="2years">2 Years</SelectItem>
                                                <SelectItem value="3years">3 Years</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleCreateKey}
                                        disabled={isCreating || !newApiKey.name || !newApiKey.expires_at}
                                    >
                                        {isCreating ? 'Creating...' : 'Create API Key'}
                                    </Button>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
                <Separator className='my-4 lg:my-6' />

                <div className="container mx-auto pb-10">
                    {loadingKeys ? (
                        <div>Loading API keys...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Key ID</TableHead>
                                    <TableHead>Expires At</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Last Used</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {apiKeys.map((key) => (
                                    <TableRow key={key.key_id}>
                                        <TableCell>{key.name}</TableCell>
                                        <TableCell className="font-mono text-sm">{key.key_id}</TableCell>
                                        <TableCell>{new Date(key.expires_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {key.last_used_at
                                                ? new Date(key.last_used_at).toLocaleDateString()
                                                : 'Never used'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRevokeKey(key.key_id)}
                                            >
                                                Revoke
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Main>
        </>
    )
}
