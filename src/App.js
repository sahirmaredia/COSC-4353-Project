import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import VolunteerMatchingForm from './pages/VolunteerMatchingForm';
import VolunteerHistory from './pages/VolunteerHistory';

function App() {
  return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/volunteer-matching" element={<VolunteerMatchingForm />} />
              <Route path="/volunteer-history" element={<VolunteerHistory />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;