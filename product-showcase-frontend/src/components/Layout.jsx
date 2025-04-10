import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <header>
                {/* Header component will be included here */}
            </header>
            <main className="flex-grow">
                {children}
            </main>
            <footer>
                {/* Footer component will be included here */}
            </footer>
        </div>
    );
};

export default Layout;