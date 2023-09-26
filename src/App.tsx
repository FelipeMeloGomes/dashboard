import { BrowserRouter } from "react-router-dom";
import "./shared/forms/TraducoesYup";
import { AppRoutes } from "./routes";
import { MenuLateral, Login } from "./shared/components";
import {
    DrawerProvider,
    AppThemeProvider,
    AuthProvider,
} from "./shared/contexts";

function App() {
    return (
        <AuthProvider>
            <AppThemeProvider>
                <Login>
                    <DrawerProvider>
                        <BrowserRouter>
                            <MenuLateral>
                                <AppRoutes />
                            </MenuLateral>
                        </BrowserRouter>
                    </DrawerProvider>
                </Login>
            </AppThemeProvider>
        </AuthProvider>
    );
}

export default App;
