import express from 'express';
import multer from 'multer';
import { createTemplate, getTemplates, updateTemplate, autoGenerateAliases, generateRegexFromSelection } from '../controllers/billTemplateController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

router.post('/auto-generate', upload.single('billFile'), autoGenerateAliases);
router.post('/generate-from-selection', generateRegexFromSelection);
router.post('/', createTemplate);
router.get('/', getTemplates);
router.put('/:id', updateTemplate);

export default router;
