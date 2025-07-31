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

interface Invoice {
  invoice_id: string
  amount_usd: string
  status: string
  created_at: string
  customer_id: string
  description: string
  expires_at: string
  network_environment: string
}

interface InvoiceResponse {
  invoices: Invoice[]
  total_count: number
  total_pages: number
  current_page: number
}

interface CreateInvoiceRequest {
  amount_usd: number
  description: string
  customer_id: string
  metadata: Record<string, any>
  expires_in: number
}

interface InvoiceCreateResponse {
  invoice_id: string;
  payment_url: string;
  expires_at: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const token = auth.getToken()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [newInvoice, setNewInvoice] = useState<CreateInvoiceRequest>({
    amount_usd: 0,
    description: '',
    customer_id: '',
    metadata: {},
    expires_in: 43200000
  })

  const fetchInvoices = async (page: number) => {
    setLoading(true)
    try {
      console.log('Fetching with token:', token);
      const response = await fetch(`https://api.pepay.io/api/v1/invoices?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })


      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch invoices: ${response.status} ${errorText}`);
      }

      const data: InvoiceResponse = await response.json()
      console.log('Received data:', data);
      setInvoices(data.invoices)
      setTotalPages(data.total_pages)
      setCurrentPage(data.current_page)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      auth.logout()
      window.location.href = '/'
    } finally {
      setLoading(false)
    }

  }

  const handleCreateInvoice = async () => {
    setIsCreating(true)
    try {
      const idempotencyKey = uuidv4()
      const response = await fetch('https://api.pepay.io/api/v1/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(newInvoice),
      })

      if (!response.ok) {
        throw new Error('Failed to create invoice')
      }

      const data: InvoiceCreateResponse = await response.json()
      setPaymentUrl(data.payment_url)
      fetchInvoices(currentPage)
      toast.success('Invoice created successfully')
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice')
    } finally {
      setIsCreating(false)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setPaymentUrl(null)
    setNewInvoice({
      amount_usd: 0,
      description: '',
      customer_id: '',
      metadata: {},
      expires_in: 43200000
    })
  }

  useEffect(() => {
    if (token) {
      fetchInvoices(currentPage)
    }
  }, [token, currentPage])

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
              Invoices
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
              <Button onClick={() => {
                setIsModalOpen(true)
                setPaymentUrl(null)
                setNewInvoice({
                  amount_usd: 0,
                  description: '',
                  customer_id: '',
                  metadata: {},
                  expires_in: 43200000
                })
              }}>
                Add Invoice
              </Button>
            </DialogTrigger>
            <DialogContent onPointerDownOutside={(e) => {
              e.preventDefault()
            }}>
              <DialogHeader>
                <DialogTitle>
                  {paymentUrl ? 'Payment URL' : 'Create New Invoice'}
                </DialogTitle>
              </DialogHeader>
              {paymentUrl ? (
                <div className="grid gap-4 py-4">
                  <div className="text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-2">
                    ⚠️ Important: Please copy this payment URL now. It will only be displayed once for security reasons.
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex flex-col gap-3">
                      <div className="text-sm font-medium">Payment URL:</div>
                      <div className="bg-background p-3 rounded-lg break-all border">
                        <code className="text-sm">{paymentUrl}</code>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => {
                          navigator.clipboard.writeText(paymentUrl)
                          toast.success('Payment URL copied to clipboard')
                        }}
                      >
                        <span className="mr-2">📋</span>
                        Copy Payment URL
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
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newInvoice.amount_usd}
                      onChange={(e) => setNewInvoice(prev => ({
                        ...prev,
                        amount_usd: parseFloat(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newInvoice.description}
                      onChange={(e) => setNewInvoice(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customerId">Customer ID</Label>
                    <Input
                      id="customerId"
                      value={newInvoice.customer_id}
                      onChange={(e) => setNewInvoice(prev => ({
                        ...prev,
                        customer_id: e.target.value
                      }))}
                    />
                  </div>
                  <Button
                    onClick={handleCreateInvoice}
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        <Separator className='my-4 lg:my-6' />

        <div className="container mx-auto pb-10">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Amount (USD)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice_id}>
                      <TableCell className="font-medium">{invoice.invoice_id.substring(0, 8)}...</TableCell>
                      <TableCell>${invoice.amount_usd}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          invoice.status === 'paid' 
                            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10' 
                            : invoice.status === 'unpaid'
                              ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/10'
                              : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10'
                        }`}>
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          invoice.network_environment === 'mainnet' 
                            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10' 
                            : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10'
                        }`}>
                          {invoice.network_environment}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(invoice.created_at).toLocaleString()}</TableCell>
                      <TableCell>{new Date(invoice.expires_at).toLocaleString()}</TableCell>
                      <TableCell>{invoice.customer_id || "-"}</TableCell>
                      <TableCell>{invoice.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-center gap-2 mt-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </Main>
    </>
  )
}
