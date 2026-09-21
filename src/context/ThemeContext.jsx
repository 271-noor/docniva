import { createContext, useEffect, useState } from "react";


export const ThemeContext = createContext();

function getInitialTheme() {

    const savedTheme = localStorage.getItem("docniva-theme");

    if (savedTheme) {
        return savedTheme;
    }

    return "light";
   
}



export function ThemeProvider ({children}) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("docniva-theme", theme);
    }, [theme]);


    const toggleTheme = () => {
        setTheme((current) => 
        current === "light" ? "dark" : "light"
        )
    }

    return (
        <ThemeContext.Provider
        value={{
            theme, 
            setTheme,
            toggleTheme,
        }}
        >
            {children}
        </ThemeContext.Provider>
    )

}