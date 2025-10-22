import React, { useState } from 'react';

function ParkingSystem() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [fee, setFee] = useState(null);
  const [error, setError] = useState('');

  // Regex for valid vehicle number (like: ABC-1234 or KA-01-AB-1234)
  const vehicleRegex = /^[A-Z]{2,3}-\d{1,4}(-[A-Z]{1,2}-\d{1,4})?$/;

  const handleCheckIn = () => {
    if (!vehicleRegex.test(vehicleNumber.toUpperCase())) {
      setError('Invalid vehicle number!');
      return;
    }
    setError('');
    setCheckInTime(new Date());
    setCheckOutTime(null);
    setFee(null);
  };

  const handleCheckOut = () => {
    if (!checkInTime) {
      setError('Vehicle has not checked in yet!');
      return;
    }
    const outTime = new Date();
    setCheckOutTime(outTime);

    const hours = Math.ceil((outTime - checkInTime) / (1000 * 60 * 60));
    const totalFee = hours * 30;
    setFee(totalFee);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Parking Management System</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Enter Vehicle Number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
        />
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>

      <button onClick={handleCheckIn} style={{ padding: '8px 16px', marginRight: '10px' }}>
        Check In
      </button>
      <button onClick={handleCheckOut} style={{ padding: '8px 16px' }}>
        Check Out
      </button>

      {checkInTime && (
        <div style={{ marginTop: '20px' }}>
          <p><strong>Check-In Time:</strong> {checkInTime.toLocaleString()}</p>
        </div>
      )}

      {checkOutTime && fee !== null && (
        <div style={{ marginTop: '10px' }}>
          <p><strong>Check-Out Time:</strong> {checkOutTime.toLocaleString()}</p>
          <p><strong>Parking Fee:</strong> Rs {fee}</p>
        </div>
      )}
    </div>
  );
}

export default ParkingSystem;