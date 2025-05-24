

function Home() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Navigation Bar */}
           

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-5xl font-bold mb-4">
                    Secure Legal Evidence Management on<br />
                    the Sui Blockchain
                </h1>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                    EviVault provides a decentralized platform for managing legal evidence and incident reports with unparalleled security and reliability.
                </p>
                {/* <button className="bg-blue-600 px-6 py-3 rounded-md hover:bg-blue-700 text-lg">
                    Access App
                </button> */}
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-10 py-16">
                <h2 className="text-3xl font-bold mb-4">Key Features</h2>
                <p className="text-gray-400 mb-12">
                    Explore the core functionalities of EviVault that ensure the integrity and accessibility of your legal evidence.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Immutable Records */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="text-2xl mb-4">🛡️</div>
                        <h3 className="text-xl font-bold mb-2">Immutable Records</h3>
                        <p className="text-gray-400">
                            Evidence and reports are stored immutably on the Sui blockchain, ensuring tamper-proof records.
                        </p>
                    </div>

                    {/* Efficient Management */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="text-2xl mb-4">📄</div>
                        <h3 className="text-xl font-bold mb-2">Efficient Management</h3>
                        <p className="text-gray-400">
                            Easily manage, search, and retrieve evidence and reports with our intuitive interface.
                        </p>
                    </div>

                    {/* Enhanced Security */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="text-2xl mb-4">🔒</div>
                        <h3 className="text-xl font-bold mb-2">Enhanced Security</h3>
                        <p className="text-gray-400">
                            Benefit from the inherent security of blockchain technology, protecting your data from unauthorized access.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-800">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                        © 2025 EviVault. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                        <a href="#" className="hover:text-white">Contact Us</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;