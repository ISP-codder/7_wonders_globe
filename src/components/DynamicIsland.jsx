// src/components/DynamicIsland.jsx
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './DynamicIsland.css'

export default function DynamicIsland() {
	const [expanded, setExpanded] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const navigate = useNavigate()

	const handleHome = () => {
		if (window.viewer?.homeButton?.viewModel) {
			window.viewer.homeButton.viewModel.command()
		}
		navigate('/')
	}

	const handleSearch = e => {
		e.preventDefault()
		const geo = window.viewer?.geocoder
		if (!geo?.viewModel || !searchQuery.trim()) return
		geo.viewModel.searchText = searchQuery.trim()
		geo.viewModel.search()
	}

	return (
		<div
			className={`dynamic-island ${expanded ? 'expanded' : ''}`}
			onMouseEnter={() => setExpanded(true)}
			onMouseLeave={() => setExpanded(false)}>
			{expanded ? (
				<>
					<form className='search-form' onSubmit={handleSearch}>
						<button className='home-btn' onClick={handleHome}>
							Home
						</button>
						<input
							type='text'
							className='search-input'
							placeholder='Search location...'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
						<button type='submit' className='search-btn'>
							Go
						</button>
					</form>
				</>
			) : (
				<div className='icons'>
					<span className='icon home-icon' onClick={handleHome} />
					<span
						className='icon search-icon'
						onClick={() => setExpanded(true)}
					/>
				</div>
			)}
		</div>
	)
}
