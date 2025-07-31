import { WizardProvider } from './wizard/context/WizardProvider'
import { WizardContent } from './wizard/components/WizardContent'
import { Container, Paper } from '@mui/material'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

export default function Profile() {
  const handleComplete = () => {
    console.log('Profile wizard completed!')
    // Could show a success message or redirect
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ overflow: 'hidden' }}>
          <WizardProvider onComplete={handleComplete}>
            <WizardContent embedded={true} />
          </WizardProvider>
        </Paper>
      </Container>
    </>
  )
}