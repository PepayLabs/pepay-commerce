import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/auth'
import { toast } from 'sonner'


interface Token {
    id: number;
    token_symbol: string;
    token_name: string;
    network: string;
    is_blocked: boolean;
}

interface TokenResponse {
    acceptance_policy: string;
    tokens: Token[];
}

export default function Networks() {
    const [tokens, setTokens] = useState<Token[]>([])
    const [acceptancePolicy, setAcceptancePolicy] = useState('')
    const [loading, setLoading] = useState(false)
    const token = auth.getAccessToken()

    const fetchTokens = async () => {
        setLoading(true)
        try {
            const response = await fetch('https://api.pepay.io/api/v1/merchant/tokens', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch tokens')
            }

            const data: TokenResponse = await response.json()
            setTokens(data.tokens)
            setAcceptancePolicy(data.acceptance_policy)
            console.log(acceptancePolicy)
        } catch (error) {
            console.error('Error fetching tokens:', error)
            setTokens([])
            auth.logout()
            window.location.href = '/'
        } finally {
            setLoading(false)
        }
    }

    const toggleTokenBlock = async (tokenId: number, newBlockedState: boolean) => {
        try {
            const response = await fetch(`https://api.pepay.io/api/v1/merchant/tokens/${tokenId}/block`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    blocked: newBlockedState
                })
            })

            if (!response.ok) {
                throw new Error('Failed to toggle token status')
            }

            const data = await response.json()

            // Update the local state
            setTokens(tokens.map(t =>
                t.id === tokenId ? { ...t, is_blocked: data.blocked } : t
            ))

            toast.success(`Token ${data.blocked ? 'blocked' : 'unblocked'} successfully`)
        } catch (error) {
            console.error('Error toggling token status:', error)
            toast.error('Failed to update token status')
        }
    }

    useEffect(() => {
        if (token) {
            fetchTokens()
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
                            Networks
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            Select your supported tokens for payment method
                        </p>
                    </div>
                </div>
                <Separator className='my-4 lg:my-6' />

                <div className="container mx-auto pb-10">
                    {loading ? (
                        <div>Loading tokens...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tokens.map((token) => (
                                <div key={token.id} className="bg-card rounded-lg shadow-sm p-6 border">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl font-bold">{token.token_symbol}</span>
                                            <span className="text-muted-foreground">({token.token_name})</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm ${!token.is_blocked ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                                                    Active
                                                </span>
                                                <button
                                                    onClick={() => toggleTokenBlock(token.id, !token.is_blocked)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${!token.is_blocked ? 'bg-primary' : 'bg-muted'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-5 w-5 rounded-full bg-background transition-transform ${!token.is_blocked ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                                <span className={`text-sm ${token.is_blocked ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                                    Blocked
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Network:</span>
                                            <span className="font-medium capitalize">{token.network}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Main>
        </>
    )
}
