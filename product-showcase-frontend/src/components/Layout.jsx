import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    // Estilos inline para o Layout
    const styles = {
        appLayout: {
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
        },
        mainContent: {
            flex: '1 1 auto',
            paddingBottom: '2rem'
        }
    };

    return (
        <div style={styles.appLayout}>
            <Header />
            <main style={styles.mainContent}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
