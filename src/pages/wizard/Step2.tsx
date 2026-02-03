import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '@/context/WizardContext';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Step2 = () => {
  const navigate = useNavigate();
  const { 
    logoFile, 
    logoPreview, 
    companyName,
    setLogoFile, 
    setLogoPreview,
    setCompanyName,
  } = useWizard();
  
  const [companyNameError, setCompanyNameError] = useState('');

  const validateCompanyName = (name: string): boolean => {
    if (!name || name.trim().length === 0) {
      setCompanyNameError('Company name is required');
      return false;
    }
    setCompanyNameError('');
    return true;
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setLogoFile(file);
        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);
      }
    },
    [setLogoFile, setLogoPreview]
  );

  const handleRemoveLogo = () => {
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        setLogoFile(file);
        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);
      }
    },
    [setLogoFile, setLogoPreview]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleContinue = () => {
    if (!validateCompanyName(companyName)) {
      toast.error('Please enter your company name');
      return;
    }
    navigate('/app/step-3');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-wizard-text mb-2">
          Company Information
        </h1>
        <p className="text-wizard-text-muted text-lg">
          Provide your company details and logo.
        </p>
      </div>

      {/* Company Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <h3 className="font-heading text-xl text-wizard-text mb-4">Company Name</h3>
        <div>
          <label className="block text-sm font-medium text-wizard-text mb-2">
            Company Name <span className="text-error">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g., Acme Corporation"
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              if (companyNameError) validateCompanyName(e.target.value);
            }}
            className={`h-12 bg-white border-wizard-border text-wizard-text ${
              companyNameError ? 'border-error focus:border-error focus:ring-error' : ''
            }`}
          />
          {companyNameError && <p className="text-error text-sm mt-1">{companyNameError}</p>}
        </div>
      </motion.div>

      {/* Logo Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <h3 className="font-heading text-xl text-wizard-text mb-4">Company Logo (Optional)</h3>
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-wizard-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="logo-upload"
          />
          <label htmlFor="logo-upload" className="cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-wizard-bg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-wizard-text-muted" />
            </div>
            <p className="text-wizard-text font-medium mb-2">
              Drag and drop your logo here
            </p>
            <p className="text-wizard-text-muted text-sm mb-4">or</p>
            <Button variant="outline" type="button" className="pointer-events-none">
              Choose File
            </Button>
            <p className="text-wizard-text-muted text-xs mt-4">
              Accepted formats: PNG, JPG, SVG
            </p>
          </label>
        </div>

        {/* Preview Area */}
        {logoPreview && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-wizard-text">Logo Preview</h3>
              <button
                onClick={handleRemoveLogo}
                className="text-wizard-text-muted hover:text-error transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-48 h-48 bg-wizard-bg rounded-xl flex items-center justify-center p-4 border border-wizard-border">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {logoFile && (
              <p className="text-wizard-text-muted text-sm mt-2">{logoFile.name}</p>
            )}
          </div>
        )}

        {!logoPreview && (
          <div className="mt-8">
            <h3 className="font-medium text-wizard-text mb-4">Logo Preview</h3>
            <div className="w-48 h-48 bg-wizard-bg rounded-xl flex items-center justify-center border border-wizard-border">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-wizard-text-muted mx-auto mb-2" />
                <p className="text-wizard-text-muted text-sm">No logo uploaded</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => navigate('/app/step-1')}
          className="px-8"
        >
          Back
        </Button>
        <Button onClick={() => navigate('/app/step-3')} size="lg" className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step2;
