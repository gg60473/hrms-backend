const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching employees'
    });
  }
});

// GET single employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching employee'
    });
  }
});

// POST create new employee
router.post('/', async (req, res) => {
  try {
    const { employeeId, name, email, department } = req.body;

    // Validation
    if (!employeeId || !name || !email || !department) {
      return res.status(400).json({
        success: false,
        error: 'All fields (employeeId, name, email, department) are required'
      });
    }

    // Check for duplicate employeeId or email
    const existingEmployee = await Employee.findOne({
      $or: [{ employeeId }, { email: email.toLowerCase() }]
    });

    if (existingEmployee) {
      if (existingEmployee.employeeId === employeeId) {
        return res.status(400).json({
          success: false,
          error: 'Employee ID already exists'
        });
      }
      if (existingEmployee.email === email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          error: 'Email address already exists'
        });
      }
    }

    // Create new employee
    const employee = await Employee.create({
      employeeId,
      name,
      email,
      department
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while creating employee'
    });
  }
});

// PUT update employee
router.put('/:id', async (req, res) => {
  try {
    const { name, email, department } = req.body;

    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== employee.email) {
      const emailExists = await Employee.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email address already exists'
        });
      }
    }

    // Update fields
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (department) employee.department = department;

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating employee'
    });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting employee'
    });
  }
});

module.exports = router;
