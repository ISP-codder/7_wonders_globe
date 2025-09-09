import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DynamicIsland from './components/DynamicIsland'
import CesiumMap from './components/CesiumMap'

function App() {
	return (
		<Router>
			<DynamicIsland />
			<Routes>
				<Route path='/' element={<CesiumMap />} />
			</Routes>
		</Router>
	)
}

export default App
