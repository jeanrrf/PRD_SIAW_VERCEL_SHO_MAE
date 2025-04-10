import React from 'react';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                {/* Header component will be included here */}
            </header>
            <main className={styles.main}>
                {children}
            </main>
            <footer className={styles.footer}>
                {/* Footer component will be included here */}
            </footer>
        </div>
    );
};

export default Layout;