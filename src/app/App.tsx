import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ViewerProvider } from '@/entities/viewer'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { RankingPage } from '@/pages/ranking'

export function App() {
    return (
        <BrowserRouter>
            <ViewerProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/ranking" element={<RankingPage />} />
                </Routes>
            </ViewerProvider>
        </BrowserRouter>
    )
}
