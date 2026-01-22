import Plan from "../models/planModal.js";

// Get all plans
export const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find().sort({ sortOrder: 1, monthlyPrice: 1 });
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create plan
export const createPlan = async (req, res) => {
    try {
        const plan = new Plan(req.body);
        await plan.save();
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.to('plans').emit('plan-created', plan);
        }
        
        res.json({ success: true, plan, message: 'Plan created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update plan
export const updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.to('plans').emit('plan-updated', plan);
        }
        
        res.json({ success: true, plan, message: 'Plan updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete plan
export const deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndDelete(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.to('plans').emit('plan-deleted', { id: req.params.id });
        }
        
        res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Seed initial plans
export const seedPlans = async (req, res) => {
    try {
        await Plan.deleteMany({});
        
        const plans = [
            {
                name: "Starter",
                monthlyPrice: 0,
                annualPrice: 0,
                tagline: "Basic Features",
                popular: false,
                features: ["Basic workout tracking", "Simple progress logging", "Basic nutrition tracking"]
            },
            {
                name: "Pro Performance",
                monthlyPrice: 29,
                annualPrice: 24,
                tagline: "Advanced Analytics",
                popular: true,
                features: ["Advanced progress analytics", "Bio analytics charts", "Weekly nutrition forecasts", "Advanced nutrition logging"]
            },
            {
                name: "Elite Force",
                monthlyPrice: 59,
                annualPrice: 49,
                tagline: "Premium Experience",
                popular: false,
                features: ["Vital trace monitoring", "AI coach neural link", "Advanced trend analysis", "Neural stability diagnostics"]
            }
        ];

        const createdPlans = await Plan.insertMany(plans);
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.to('plans').emit('plans-seeded', createdPlans);
        }
        
        res.json({ success: true, message: "Plans seeded successfully", plans: createdPlans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};