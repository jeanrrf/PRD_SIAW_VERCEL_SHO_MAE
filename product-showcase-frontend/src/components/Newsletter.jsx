import React, { useState } from 'react';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        // Simulate an API call
        setTimeout(() => {
            setMessage('Obrigado por se inscrever! Em breve você receberá nossas ofertas.');
            setEmail('');
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-2xl font-bold mb-4">Receba Ofertas Exclusivas</h3>
                    <p className="text-gray-600 mb-6">Assine nossa newsletter e receba as melhores ofertas diretamente no seu email.</p>
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Digite seu email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-grow pl-4 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                        />
                        <button
                            type="submit"
                            className={`bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Enviando...' : 'Inscrever-se'}
                        </button>
                    </form>
                    {message && <div className="mt-4 text-sm text-green-500">{message}</div>}
                    <p className="text-gray-500 text-sm mt-4">Prometemos não enviar spam. Você pode cancelar a inscrição a qualquer momento.</p>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;