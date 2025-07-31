import { IconSearch } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-context'
import { Button } from './ui/button'

interface Props {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '', placeholder = 'Search' }: Props) {
  const { setOpen } = useSearch()
  return (
    <Button
      variant='outline'
      className={cn(
        'relative h-8 w-full flex-1 md:flex-none justify-start rounded-md bg-muted/25 hover:bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64',
        className
      )}
      onClick={() => setOpen(true)}
    >
      <IconSearch
        aria-hidden='true'
        className='absolute left-1.5 top-1/2 -translate-y-1/2'
      />
      <span className='ml-3'>{placeholder}</span>

    </Button>
  )
}
