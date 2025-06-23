
import {Route , Routes } from 'react-router-dom'

import SignIn from './components/SignIn'
import HomePage from './components/HomePage'
import HomePageAdmin from './components/HomePageAdmin'
import Employee from './components/Employee'
import Worker from './components/Worker'
import JobSection from './components/JobSection'
import LeaveType from './components/LeaveTyp'
import Wages from './components/Wages'
import Salary from './components/Salary'
import BonusEid from './components/BonusEid'
import OverTime from './components/OverTime'
import WagesSlip from './components/WagesSlip'

function App() {
  return (
    <div className="App">
      
        <Routes>
          <Route exact path="/" element={<SignIn />} />
          <Route exact path="/SignIn" element={<SignIn />} />
        <Route exact path="/HomePage" element={<HomePage />} />
        <Route exact path="/HomePageAdmin" element={<HomePageAdmin />} />
        <Route exact path="/Employee" element={<Employee />} />
        <Route exact path="/Worker" element={<Worker />} />
        <Route exact path="/JobSection" element={<JobSection />} />
        <Route exact path="/LeaveTyp" element={<LeaveType />} />
        <Route exact path="/Wages" element={<Wages />} />
        <Route exact path="/Salary" element={<Salary />} />
        <Route exact path="/BonusEid" element={<BonusEid />} />
        <Route exact path="/OverTime" element={<OverTime />} />
        <Route exact path="/WagesSlip" element={<WagesSlip />} />
        </Routes>
         
    </div>
  )
}

export default App
