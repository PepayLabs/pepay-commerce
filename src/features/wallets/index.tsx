import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/auth'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { LockIcon, EyeIcon, EyeOffIcon, ShieldAlertIcon } from "lucide-react"
import axios from 'axios'

// Create axios instance with base URL
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_API_URL 
        : 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = auth.getAccessToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

interface Wallet {
    id: number;
    address: string;
    type: string;
    is_active: boolean;
    created_at: string;
}

interface NetworkWallets {
    network: string;
    wallets: Wallet[];
}

// Network SVG Components
const BNBIcon = ({ className }: { className?: string }) => (
    <img 
        src="/images/bnb.webp" 
        alt="BNB Chain" 
        className={className}
    />
)

const BaseIcon = ({ className }: { className?: string }) => (
    <img 
        src="/images/base.png" 
        alt="Base" 
        className={className}
    />
)

const SolanaIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 32 32" className={className}>
        <defs>
            <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00FFA3"/>
                <stop offset="100%" stopColor="#DC1FFF"/>
            </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#solanaGradient)"/>
        <g fill="#FFF">
            <path d="M8.408 22.693c.166-.154.385-.24.616-.24h13.583a.453.453 0 0 1 .325.783l-2.69 2.747c-.166.155-.385.24-.616.24H5.043a.453.453 0 0 1-.325-.783l2.69-2.747Z"/>
            <path d="M8.408 5.831c.166-.155.385-.24.616-.24h13.583a.453.453 0 0 1 .325.783l-2.69 2.747c-.166.155-.385.24-.616.24H5.043a.453.453 0 0 1-.325-.783l2.69-2.747Z"/>
            <path d="M23.592 13.708c-.166-.154-.385-.24-.616-.24H9.393a.453.453 0 0 0-.325.783l2.69 2.747c.166.155.385.24.616.24h13.583a.453.453 0 0 0 .325-.783l-2.69-2.747Z"/>
        </g>
    </svg>
)

// Helper function to get network icon
const getNetworkIcon = (network: string, className: string = "h-7 w-7") => {
    switch (network.toLowerCase()) {
        case 'bsc':
            return <BNBIcon className={className} />
        case 'base':
            return <BaseIcon className={className} />
        case 'solana':
            return <SolanaIcon className={className} />
        default:
            return (
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="capitalize text-base font-bold text-primary">{network[0]}</span>
                </div>
            )
    }
}

// Helper function to sort networks with BNB first
const sortNetworksByPriority = (networks: NetworkWallets[]): NetworkWallets[] => {
    const priority = ['bsc', 'base', 'solana'];
    return networks.sort((a, b) => {
        const aIndex = priority.indexOf(a.network.toLowerCase());
        const bIndex = priority.indexOf(b.network.toLowerCase());
        
        // If both are in priority list, sort by priority
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        // If only one is in priority, prioritize it
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        // If neither is in priority, sort alphabetically
        return a.network.localeCompare(b.network);
    });
};

export default function Wallets() {
    const [wallets, setWallets] = useState<NetworkWallets[]>([])
    const [loading, setLoading] = useState(false)
    const token = auth.getAccessToken()
    const [open, setOpen] = useState(false)
    const [network, setNetwork] = useState("")
    const [walletAddress, setWalletAddress] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
    const [showKeyModal, setShowKeyModal] = useState(false)
    const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null)
    const [pinCode, setPinCode] = useState("")
    const [walletDetails, setWalletDetails] = useState<{
        private_key: string;
        network: string;
        public_address: string;
    } | null>(null)
    const [isLoadingKey, setIsLoadingKey] = useState(false)
    const [showPrivateKey, setShowPrivateKey] = useState(false)

    const fetchWallets = async () => {
        setLoading(true)
        try {
            const response = await api.get('/api/accounts/wallets')
            setWallets(response.data)
        } catch (error) {
            console.error('Error fetching wallets:', error)
            toast.error('Failed to fetch wallets')
            setWallets([])
            auth.logout()
            window.location.href = '/'
        } finally {
            setLoading(false)
        }
    }

    const handleCreateWallet = async () => {
        if (!network || !walletAddress) {
            toast.error('Please fill in all fields')
            return
        }

        setIsSubmitting(true)
        try {
            await api.post('/api/accounts/wallets/add-non-custodial', {
                network,
                wallet_address: walletAddress,
            })

            toast.success('Wallet created successfully')
            setOpen(false)
            fetchWallets()
            setNetwork("")
            setWalletAddress("")
        } catch (error) {
            console.error('Error creating wallet:', error)
            toast.error('Failed to create wallet')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleModalClose = (open: boolean) => {
        setOpen(open)
        if (!open) {
            setNetwork("")
            setWalletAddress("")
        }
    }

    const handleStatusToggle = async (walletId: number, currentStatus: boolean) => {
        try {
            await api.put(`/api/accounts/wallets/${walletId}/status`, {
                is_active: !currentStatus
            })

            toast.success('Wallet status updated successfully')
            fetchWallets() // Refresh the list
        } catch (error) {
            console.error('Error updating wallet status:', error)
            toast.error('Failed to update wallet status')
        }
    }

    const handleFetchPrivateKey = async () => {
        if (!selectedWalletId || !pinCode) {
            toast.error('Please enter PIN code')
            return
        }

        setIsLoadingKey(true)
        try {
            const response = await api.post(`/api/accounts/wallets/${selectedWalletId}/private-key`, {
                pincode: pinCode
            })

            setWalletDetails(response.data)
        } catch (error) {
            console.error('Error fetching wallet details:', error)
            toast.error('Failed to fetch wallet details')
        } finally {
            setIsLoadingKey(false)
        }
    }

    const handleCloseKeyModal = () => {
        setShowKeyModal(false)
        setPinCode("")
        setWalletDetails(null)
        setSelectedWalletId(null)
    }

    const filteredWallets = sortNetworksByPriority(
        wallets.map(networkWallet => ({
            ...networkWallet,
            wallets: networkWallet.wallets.filter(wallet => {
                if (filterStatus === 'all') return true;
                if (filterStatus === 'active') return wallet.is_active;
                return !wallet.is_active;
            })
        })).filter(networkWallet => networkWallet.wallets.length > 0)
    );

    useEffect(() => {
        if (token) {
            fetchWallets()
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
                            Wallets
                        </h1>
                        <p className='text-sm text-muted-foreground'>
        Manage your payment address. Add your non-custodial wallet to our supported networks to receive your payments directly. Manage your private key for custodial wallets if necessary.
    </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterStatus(value)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Wallets</SelectItem>
                                <SelectItem value="active">Active Only</SelectItem>
                                <SelectItem value="inactive">Inactive Only</SelectItem>
                            </SelectContent>
                        </Select>
                        <Dialog open={open} onOpenChange={handleModalClose}>
                            <DialogTrigger asChild>
                                <Button>Add Wallet</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Wallet</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Network</label>
                                        <Select value={network} onValueChange={setNetwork}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select network" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bsc">
                                                    <div className="flex items-center gap-2">
                                                        <BNBIcon className="h-4 w-4" />
                                                        BNB Chain
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="base">
                                                    <div className="flex items-center gap-2">
                                                        <BaseIcon className="h-4 w-4" />
                                                        Base
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="solana">
                                                    <div className="flex items-center gap-2">
                                                        <SolanaIcon className="h-4 w-4" />
                                                        Solana
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Wallet Address</label>
                                        <Input
                                            placeholder="Enter wallet address"
                                            value={walletAddress}
                                            onChange={(e) => setWalletAddress(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={handleCreateWallet}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Wallet'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <Separator className='my-4 lg:my-6' />

                <div className="container mx-auto pb-10">
                    {loading ? (
                        <div>Loading wallets...</div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {filteredWallets.map((networkWallet) => (
                                <Card key={networkWallet.network} className="backdrop-blur-sm bg-card/50 border-muted/20 shadow-md hover:shadow-xl transition-all duration-200">
                                    <CardHeader className="pb-3 pt-4">
                                        <CardTitle className="flex items-center justify-between text-lg">
                                            <div className="flex items-center gap-2">
                                                {getNetworkIcon(networkWallet.network)}
                                                <span className="capitalize font-medium">{networkWallet.network === 'bsc' ? 'BNB Chain' : networkWallet.network}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-xs">
                                                    {networkWallet.wallets.length} wallet{networkWallet.wallets.length !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {networkWallet.wallets.map((wallet) => (
                                            <div
                                                key={wallet.id}
                                                className="rounded-lg border border-muted/30 bg-background/50 p-3 space-y-2 hover:bg-accent/5 hover:border-accent/20 transition-all duration-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="capitalize text-xs">
                                                        {wallet.type}
                                                    </Badge>
                                                    <div className="flex items-center gap-2">
                                                        {wallet.type === 'custodial' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedWalletId(wallet.id)
                                                                    setShowKeyModal(true)
                                                                }}
                                                                className="p-1.5 hover:bg-accent/80 rounded-full transition-colors"
                                                            >
                                                                <LockIcon className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {!wallet.is_active && (
                                                            <Switch
                                                                checked={wallet.is_active}
                                                                onCheckedChange={() => handleStatusToggle(wallet.id, wallet.is_active)}
                                                                className="data-[state=checked]:bg-success"
                                                            />
                                                        )}
                                                        <Badge
                                                            variant={wallet.is_active ? "secondary" : "destructive"}
                                                            className="rounded-full text-xs"
                                                        >
                                                            {wallet.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="relative group">
                                                    <code className="block text-xs bg-muted/30 p-2 rounded-lg break-all group-hover:bg-muted/50 transition-colors">
                                                        {wallet.address}
                                                    </code>
                                                </div>
                                                <div className="flex justify-end text-[11px] text-muted-foreground">
                                                    <time dateTime={wallet.created_at}>
                                                        {new Date(wallet.created_at).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </time>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </Main>

            <Dialog open={showKeyModal} onOpenChange={handleCloseKeyModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Wallet Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {!walletDetails ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Enter PIN Code</label>
                                    <Input
                                        type="password"
                                        placeholder="Enter your PIN code"
                                        value={pinCode}
                                        onChange={(e) => setPinCode(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleFetchPrivateKey}
                                    disabled={isLoadingKey}
                                    className="w-full"
                                >
                                    {isLoadingKey ? "Loading..." : "View Details"}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Network</label>
                                    <div className="rounded-lg bg-muted p-3">
                                        <p className="text-sm font-medium">{walletDetails.network}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Public Address</label>
                                    <div className="rounded-lg bg-muted p-3">
                                        <code className="text-xs break-all">{walletDetails.public_address}</code>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-muted-foreground">Private Key</label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {showPrivateKey ? (
                                                <EyeOffIcon className="h-4 w-4" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="rounded-lg bg-muted p-3 relative">
                                        <code
                                            className={`text-xs break-all transition-all duration-200 ${showPrivateKey ? "" : "blur-sm select-none"
                                                }`}
                                        >
                                            {walletDetails.private_key}
                                        </code>
                                        {!showPrivateKey && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-sm text-muted-foreground">
                                                    Click the eye icon to view
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-start gap-2 text-xs text-amber-500 dark:text-amber-400">
                                        <ShieldAlertIcon className="h-4 w-4 flex-shrink-0" />
                                        <p>
                                            Never share your private key with anyone. Anyone with your private key has full control of your wallet.
                                        </p>
                                    </div>
                                </div>
                                <DialogClose asChild>
                                    <Button className="w-full">Close</Button>
                                </DialogClose>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
