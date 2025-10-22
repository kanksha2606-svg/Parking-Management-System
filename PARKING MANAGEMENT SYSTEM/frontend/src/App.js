import React, { useState, useEffect } from 'react';
import './App.css';

const TOTAL_SLOTS = 40;
const API_URL = 'http://localhost:8082/api';

function App() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [slots, setSlots] = useState(Array(TOTAL_SLOTS).fill(null));
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [feeMessage, setFeeMessage] = useState('');
  const [stats, setStats] = useState({ total: 40, occupied: 0, available: 40 });
  const [darkMode, setDarkMode] = useState(true);
  const [animatingCar, setAnimatingCar] = useState(null);
  const [leavingCar, setLeavingCar] = useState(null);
  const [highlightSlot, setHighlightSlot] = useState(null);

  const vehicleRegex = /^[A-Z]{2,3}-\d{1,4}(-[A-Z]{1,2}-\d{1,4})?$/;

  useEffect(() => {
    fetchParkingData();
    const interval = setInterval(fetchParkingData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchParkingData = async () => {
    try {
      const spotsResponse = await fetch(`${API_URL}/parking-spots`);
      const spotsData = await spotsResponse.json();
      
      const vehiclesResponse = await fetch(`${API_URL}/vehicles/parked`);
      const vehiclesData = await vehiclesResponse.json();
      
      const newSlots = Array(TOTAL_SLOTS).fill(null);
      
      vehiclesData.forEach(vehicle => {
        const spotNumber = parseInt(vehicle.parkingSpot.spotNumber);
        if (spotNumber >= 1 && spotNumber <= 40) {
          newSlots[spotNumber - 1] = {
            vehicle: vehicle.licensePlate,
            time: new Date(vehicle.entryTime)
          };
        }
      });
      
      setSlots(newSlots);
      
      setStats({
        total: 40,
        occupied: vehiclesData.length,
        available: 40 - vehiclesData.length
      });
    } catch (error) {
      console.error('Error fetching parking data:', error);
    }
  };

  const getSlotPosition = (slotIndex) => {
    const gridElement = document.querySelector('.slotsGrid');
    if (!gridElement) return { x: 0, y: 0 };
    
    const row = Math.floor(slotIndex / 10);
    const col = slotIndex % 10;
    
    const slotWidth = gridElement.offsetWidth / 10;
    const slotHeight = slotWidth * 1.2;
    
    return {
      x: col * slotWidth + slotWidth / 2,
      y: row * slotHeight + slotHeight / 2
    };
  };

  const handleCheckIn = async () => {
    const number = vehicleNumber.toUpperCase();
    if (!vehicleRegex.test(number)) {
      setError('Invalid vehicle number!');
      return;
    }

    const freeIndex = slots.findIndex(slot => slot === null);
    if (freeIndex === -1) {
      setError('No available slots!');
      return;
    }

    const targetPos = getSlotPosition(freeIndex);
    
    // Highlight the target slot
    setHighlightSlot(freeIndex);
    
    setAnimatingCar({ 
      vehicle: number, 
      targetSlot: freeIndex,
      targetX: targetPos.x,
      targetY: targetPos.y,
      phase: 'entering'
    });

    try {
      const response = await fetch(`${API_URL}/vehicles/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licensePlate: number,
          vehicleType: 'CAR',
          ownerName: 'Guest',
          ownerPhone: '0000000000',
          spotNumber: (freeIndex + 1).toString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setTimeout(() => {
          setAnimatingCar(prev => ({ ...prev, phase: 'parking' }));
          
          setTimeout(() => {
            setAnimatingCar(prev => ({ ...prev, phase: 'shrinking' }));
            
            setTimeout(() => {
              setAnimatingCar(null);
              setHighlightSlot(null);
              fetchParkingData();
              setError('');
              setVehicleNumber('');
              setFeeMessage('');
              setSearchResult('');
              addActivity(
                `${number} checked in at slot ${freeIndex + 1}`, 
                'in',
                new Date(data.entryTime)
              );
            }, 800);
          }, 500);
        }, 1800);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Check-in failed');
        setAnimatingCar(null);
        setHighlightSlot(null);
      }
    } catch (error) {
      setError('Connection error. Is backend running?');
      setAnimatingCar(null);
      setHighlightSlot(null);
      console.error('Check-in error:', error);
    }
  };

  const handleCheckOut = async () => {
    const number = vehicleNumber.toUpperCase();
    
    const slotIndex = slots.findIndex(slot => slot && slot.vehicle === number);
    
    if (slotIndex !== -1) {
      const startPos = getSlotPosition(slotIndex);
      
      // Highlight slot first
      setHighlightSlot(slotIndex);
      
      // Wait a moment before starting animation
      setTimeout(() => {
        setLeavingCar({ 
          vehicle: number, 
          slotIndex: slotIndex,
          startX: startPos.x,
          startY: startPos.y,
          phase: 'expanding'
        });
      }, 300);
    }
    
    try {
      const response = await fetch(`${API_URL}/vehicles/checkout/${number}`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        const slotNum = data.parkingSpot.spotNumber;
        const fee = data.parkingFee;
        
        // Expand phase
        setTimeout(() => {
          setLeavingCar(prev => ({ ...prev, phase: 'driving' }));
          
          // Clear slot during drive
          setTimeout(() => {
            fetchParkingData();
            
            // Complete animation
            setTimeout(() => {
              setLeavingCar(null);
              setHighlightSlot(null);
              setError('');
              setVehicleNumber('');
              setSearchResult('');
              setFeeMessage(`Vehicle ${number} checked out from slot ${slotNum}. Total Parking Fee: Rs ${fee}`);
              addActivity(
                `${number} checked out from slot ${slotNum} (Fee: Rs ${fee})`, 
                'out',
                new Date(data.exitTime)
              );
            }, 1500);
          }, 800);
        }, 1200);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Vehicle not found or not checked in');
        setLeavingCar(null);
        setHighlightSlot(null);
      }
    } catch (error) {
      setError('Connection error. Is backend running?');
      setLeavingCar(null);
      setHighlightSlot(null);
      console.error('Check-out error:', error);
    }
  };

  const handleFindVehicle = async () => {
    const number = vehicleNumber.toUpperCase();
    
    try {
      const response = await fetch(`${API_URL}/vehicles/find/${number}`);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'PARKED') {
          const entryTime = new Date(data.entryTime);
          const now = new Date();
          const hours = Math.ceil((now - entryTime) / (1000 * 60 * 60));
          const currentFee = hours * 30;
          
          const slotIndex = slots.findIndex(slot => slot && slot.vehicle === number);
          if (slotIndex !== -1) {
            setHighlightSlot(slotIndex);
            setTimeout(() => setHighlightSlot(null), 3000);
          }
          
          setSearchResult(
            `Vehicle ${number} is parked at slot ${data.parkingSpot.spotNumber}. ` +
            `Entry: ${entryTime.toLocaleString('en-IN')}. ` +
            `Current estimated fee: Rs ${currentFee}`
          );
        } else {
          setSearchResult(`Vehicle ${number} was parked but has checked out`);
        }
        setFeeMessage('');
      } else {
        setSearchResult(`Vehicle ${number} not found in parking`);
      }
    } catch (error) {
      setError('Connection error. Is backend running?');
      console.error('Find vehicle error:', error);
    }
  };

  const addActivity = (text, type, timestamp = new Date()) => {
    const newActivity = {
      text,
      type,
      timestamp: timestamp,
      displayTime: timestamp.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    };
    setRecentActivity(prev => [newActivity, ...prev].slice(0, 10));
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Parking Management System</h1>
        <button className="darkModeBtn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

      <div className="dashboard">
        <div className="statsCard animate-fade-in">
          <p className="statsLabel">Total Slots</p>
          <h2 className="statsValue">{stats.total}</h2>
        </div>
        <div className="statsCard animate-fade-in" style={{animationDelay: '0.1s'}}>
          <p className="statsLabel">Occupied</p>
          <h2 className="statsValue occupied-color">{stats.occupied}</h2>
        </div>
        <div className="statsCard animate-fade-in" style={{animationDelay: '0.2s'}}>
          <p className="statsLabel">Available</p>
          <h2 className="statsValue available-color">{stats.available}</h2>
        </div>
      </div>

      <div className="mainContent">
        <div className="parkingMap">
          <h3 className="sectionTitle">Parking Lot Map</h3>
          <div className="slotsGrid">
            {slots.map((slot, i) => {
              const isLeavingFromThisSlot = leavingCar && leavingCar.slotIndex === i;
              const isShrinking = animatingCar && animatingCar.targetSlot === i && animatingCar.phase === 'shrinking';
              const isHighlighted = highlightSlot === i;
              
              return (
                <div
                  key={i}
                  className={`slot ${slot ? 'occupied' : 'available'} ${
                    isShrinking ? 'slot-appearing' : ''
                  } ${isLeavingFromThisSlot && leavingCar.phase === 'expanding' ? 'slot-expanding' : ''} ${
                    isHighlighted ? 'slot-highlighted' : ''
                  }`}
                >
                  {slot && !isLeavingFromThisSlot ? (
                    <div className="slotContent">
                      <div style={{fontSize: '16px'}}>🚗</div>
                      <span className="slotText">{slot.vehicle}</span>
                    </div>
                  ) : (
                    <span className="slotNumber">{i + 1}</span>
                  )}
                </div>
              );
            })}
            
            {animatingCar && (
              <div 
                className={`animated-car-professional ${animatingCar.phase}`}
                style={{
                  '--target-x': `${animatingCar.targetX}px`,
                  '--target-y': `${animatingCar.targetY}px`
                }}
              >
                <div className="car-body-professional">
                  <div className="car-icon-professional">🚗</div>
                  <div className="car-plate-professional">{animatingCar.vehicle}</div>
                  <div className="car-shadow"></div>
                </div>
              </div>
            )}
            
            {leavingCar && (
              <div 
                className={`animated-car-professional checkout ${leavingCar.phase}`}
                style={{
                  '--start-x': `${leavingCar.startX}px`,
                  '--start-y': `${leavingCar.startY}px`
                }}
              >
                <div className="car-body-professional">
                  <div className="car-icon-professional">🚗</div>
                  <div className="car-plate-professional">{leavingCar.vehicle}</div>
                  <div className="car-shadow"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="vehicleActions">
          <h3 className="sectionTitle">Vehicle Actions</h3>
          <input
            type="text"
            placeholder="Enter license plate (e.g., MH-1234)"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            className="input-field"
          />
          {error && <p className="error error-shake">{error}</p>}

          <div className="actionBtns">
            <button className="checkIn action-button" onClick={handleCheckIn}>
              <span>Check In</span>
            </button>
            <button className="checkOut action-button" onClick={handleCheckOut}>
              <span>Check Out</span>
            </button>
            <button className="findBtn action-button" onClick={handleFindVehicle}>
              <span>Find</span>
            </button>
          </div>

          {searchResult && (
            <p className="searchResult fade-in">{searchResult}</p>
          )}
          {feeMessage && (
            <p className="feeMessage fade-in">{feeMessage}</p>
          )}

          <h3 className="sectionTitle">Recent Activity</h3>
          <div className="recentActivity">
            {recentActivity.length === 0 ? (
              <p className="noActivity">No recent activity</p>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="activityItem slide-in" style={{animationDelay: `${idx * 0.05}s`}}>
                  <div className="activityIcon">
                    {activity.type === 'in' ? '🟢' : '🔴'}
                  </div>
                  <div className="activityText">
                    <strong>{activity.text}</strong>
                    <br />
                    <small className="activityTime">{activity.displayTime}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;