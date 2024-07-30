import { Navbar } from "./Components/navbar/Navbar";
import { Routers } from "./Router";
import { AuthProvider } from "./store/authcontext";
import './App.css'; // Ensure you import the CSS file

function App() {
  return (
    <AuthProvider>
      <Navbar />
        <Routers />     
    </AuthProvider>
  );
}

export default App;
