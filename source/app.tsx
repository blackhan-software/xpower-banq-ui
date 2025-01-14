import "./app.scss";

import { AppConsent, AppFooter, AppNavbar } from "@/component";
import { Home } from "@/component/page.home";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Div, Footer, Header, Main } from "./react/element";

export const App = () => {
    return <Div class={[
        "container-fluid",
        "flex-column",
        "min-vh-100",
        "d-flex",
    ]}>
        <Router>
            <Header class={[
                "mx-1 mt-2 mb-3",
                "navbar",
            ]}>
                <AppNavbar />
            </Header>
            <Main class={[
                "justify-content-center",
                "align-items-center",
                "flex-fill",
                "d-flex",
            ]}>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </Main>
            <Footer class={[
                "mx-1 mt-3 mb-1",
                "text-muted",
                "navbar",
                "small",
            ]}>
                <AppFooter />
                <AppConsent />
            </Footer>
        </Router>
    </Div>;
};
export default App;
