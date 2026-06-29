import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Get all dynamic forms
router.get('/', async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
      include: { fields: true }
    });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new dynamic form
router.post('/', async (req, res) => {
  try {
    const { title, description, eventId, fields, logic } = req.body;
    const form = await prisma.form.create({
      data: {
        title,
        description,
        eventId,
        fields: {
          create: fields
        },
        logic: logic ? {
          create: logic
        } : undefined
      },
      include: { fields: true, logic: true }
    });
    res.status(201).json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a form response
router.post('/:id/responses', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, userId } = req.body;
    
    const response = await prisma.formResponse.create({
      data: {
        formId: id,
        userId,
        answers: {
          create: answers.map(ans => ({
            fieldId: ans.fieldId,
            value: ans.value
          }))
        }
      },
      include: { answers: true }
    });
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get form analytics/responses
router.get('/:id/responses', async (req, res) => {
  try {
    const { id } = req.params;
    const responses = await prisma.formResponse.findMany({
      where: { formId: id },
      include: { answers: { include: { field: true } } }
    });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
