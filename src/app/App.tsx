import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ViewerProvider } from '@/entities/viewer'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'

export function App() {
    return (
        <BrowserRouter>
            <ViewerProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </ViewerProvider>
        </BrowserRouter>
    )
}
