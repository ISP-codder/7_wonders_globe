import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store'
import DynamicIsland from './components/DynamicIsland'
import CesiumMap from './components/CesiumMap'

function App() {
	return (
		<Provider store={store}>
			<Router>
				<DynamicIsland />
				<Routes>
					<Route path='/' element={<CesiumMap />} />
				</Routes>
			</Router>
		</Provider>
	)
}

export default App
