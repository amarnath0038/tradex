import { createRootRoute, Link, Outlet } from "@tanstack/react-router";


export const Route = createRootRoute({
    component: () => (
        <div className="min-h-screen bg-gray-900 text-gray-50">
            <header className="flex justify-between bg-slate-800">
                <h1 className="text-5xl">
                    TradeX
                </h1>
                <nav className="text-3xl space-x-4 m-2">
                    <Link to="/" className="[&.active]:font-bold">Home</Link>
                    <Link to="/about" className="[&.active]:font-bold">About</Link>
                </nav>
            </header>

            <main className="p-4">
                <Outlet />
            </main>
        </div>
    )
})