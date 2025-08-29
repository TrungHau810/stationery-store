import { createContext, useState } from "react";


export const MyUserContext = createContext();
export const MyCartContext = createContext();

export const SearchContext = createContext();
export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
            {children}
        </SearchContext.Provider>
    );
};