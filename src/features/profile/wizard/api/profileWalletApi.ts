import { axiosInstance } from '@/lib/axios'

interface Wallet {
  id: string
  address: string
  type: string
  is_active: boolean
  created_at: string
}

interface NetworkWallets {
  network: string
  wallets: Wallet[]
}

const getAccountWallets = async (): Promise<NetworkWallets[]> => {
  const response = await axiosInstance.get('/api/accounts/wallets')
  return response.data
}

const addNonCustodialWallet = async (network: string, address: string) => {
  const response = await axiosInstance.post('/api/accounts/wallets/add-non-custodial', {
    network,
    address
  })
  return response.data
}

const deleteWallet = async (walletId: string) => {
  const response = await axiosInstance.delete(`/api/accounts/wallets/${walletId}`)
  return response.data
}

export const profileWalletApi = {
  getAccountWallets,
  addNonCustodialWallet,
  deleteWallet
}
