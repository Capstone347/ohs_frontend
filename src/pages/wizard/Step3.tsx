import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "@/context/WizardContext";
import { provinces, getTOCForPlan } from "@/data/mockData";
import { Loader2, FileText, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api, ApiError } from "@/services/api";
import { provinceNameToCode } from "@/lib/provinceMapping";

const Step3 = () => {
  const navigate = useNavigate();
  const {
    selectedPlan,
    hasIndustryAddOn,
    province,
    naicsCode,
    businessDescription,
    companyName,
    logoFile,
    tocGenerated,
    orderId,
    documentId,
    setProvince,
    setNaicsCode,
    setBusinessDescription,
    setTocGenerated,
    setDocumentId,
  } = useWizard();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (tocGenerated && documentId && !previewUrl) {
      const fetchPreview = async () => {
        setIsLoadingPreview(true);
        try {
          console.log("Fetching preview for document:", documentId);
          const blob = await api.downloadPreview(documentId);
          console.log("Preview blob received:", blob.type, blob.size, "bytes");
          const url = URL.createObjectURL(blob);
          console.log("Blob URL created:", url);
          setPreviewUrl(url);
        } catch (error) {
          console.error("Failed to load preview:", error);
          toast.error("Failed to load document preview");
        } finally {
          setIsLoadingPreview(false);
        }
      };
      fetchPreview();
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [tocGenerated, documentId, previewUrl]);

  const validateNaicsCode = (code: string) => {
    if (!code) return "NAICS code is required";
    if (!/^\d{2,6}$/.test(code)) return "NAICS code must be 2-6 digits";
    return "";
  };

  const handleGenerateTOC = async () => {
    const validationError = validateNaicsCode(naicsCode);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!orderId) {
      toast.error("Order ID not found. Please start over.");
      navigate("/app/step-1");
      return;
    }

    if (!companyName) {
      toast.error("Company name is required. Please go back to Step 2.");
      navigate("/app/step-2");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const provinceCode = provinceNameToCode(province);

      await api.updateCompanyDetails(orderId, {
        company_name: companyName,
        province: provinceCode,
        naics_codes: naicsCode,
        logo: logoFile || undefined,
        business_description:
          businessDescription && businessDescription.trim() !== ""
            ? businessDescription
            : undefined,
      });

      const response = await api.generatePreview(orderId);
      setDocumentId(response.document_id);
      setTocGenerated(true);
      toast.success("Document preview generated!");
    } catch (error) {
      console.error("Failed to generate preview:", error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to generate preview. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const tocItems = selectedPlan
    ? getTOCForPlan(selectedPlan.id, hasIndustryAddOn)
    : [];

  const planName =
    selectedPlan?.id === "comprehensive" ? "Comprehensive" : "Basic";

  const fullPlanName = hasIndustryAddOn
    ? `${planName} + Industry-Specific`
    : planName;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-wizard-text mb-2">
          Enter Your Industry Code
        </h1>
        <p className="text-wizard-text-muted text-lg">
          Generate a tailored Health & Safety Manual based on your NAICS code.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-wizard-text mb-2">
              Province
            </label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="h-12 bg-white border-wizard-border text-wizard-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-wizard-text mb-2">
              NAICS Industry Code
            </label>
            <Input
              type="text"
              placeholder="e.g., 23 (Construction) or 31 (Manufacturing)"
              value={naicsCode}
              onChange={(e) => {
                setNaicsCode(e.target.value);
                setError("");
              }}
              className={`h-12 bg-white border-wizard-border text-wizard-text placeholder:text-wizard-text-muted ${
                error ? "border-error focus:border-error focus:ring-error" : ""
              }`}
            />
            {error ? (
              <p className="text-error text-sm mt-1">{error}</p>
            ) : (
              <p className="text-wizard-text-muted text-xs mt-1">
                Enter a 2-6 digit NAICS code
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <label
              htmlFor="businessDescription"
              className="block text-sm font-medium text-wizard-text"
            >
              Business Description
              <span className="text-wizard-text-muted font-normal">
                {" "}
                (Optional)
              </span>
            </label>

            <div className="group relative inline-flex">
              <Info className="w-4 h-4 text-wizard-text-muted cursor-help" />
              <div className="absolute left-0 top-6 z-20 hidden w-80 rounded-lg border border-wizard-border bg-white p-3 text-xs text-wizard-text-muted shadow-lg group-hover:block">
                Include what your business does, the main products/services, who
                you serve, and the problem you solve. Add location or
                differentiators if relevant.
              </div>
            </div>
          </div>

          <textarea
            id="businessDescription"
            rows={4}
            placeholder="Example: We provide residential HVAC installation and maintenance for homeowners in Ontario, specializing in energy-efficient retrofits."
            value={businessDescription || ""}
            onChange={(e) => setBusinessDescription(e.target.value)}
            className="w-full rounded-md border border-wizard-border bg-white px-3 py-3 text-sm text-wizard-text placeholder:text-wizard-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Button
          onClick={handleGenerateTOC}
          disabled={isGenerating || !naicsCode}
          variant="outline"
          className="bg-wizard-text text-white border-wizard-text hover:bg-wizard-text/90 hover:text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Preview...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate Document Preview
            </>
          )}
        </Button>
      </motion.div>

      {tocGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h2 className="font-heading text-xl text-wizard-text mb-4">
            Your H&S Manual Preview
          </h2>

          <div className="relative bg-white rounded-2xl shadow-xl border border-wizard-border overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 md:px-8 py-6 border-b border-wizard-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg md:text-xl font-semibold text-wizard-text">
                    Health & Safety Manual
                  </h3>
                  <p className="text-sm text-wizard-text-muted">
                    {fullPlanName} Edition • {province} • NAICS {naicsCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-32">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : previewUrl ? (
                <>
                  <div className="relative h-[700px] overflow-hidden bg-gray-100">
                    <object
                      data={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      type="application/pdf"
                      className="w-full h-full pointer-events-none"
                    >
                      <embed
                        src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        type="application/pdf"
                        className="w-full h-full pointer-events-none"
                      />
                    </object>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-50% to-white pointer-events-none" />

                  <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-[1px] pointer-events-none" />

                  <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 md:px-8 py-4 border border-primary/20 shadow-2xl">
                      <p className="text-lg font-medium text-primary text-center mb-1">
                        ✨ Continue reading
                      </p>
                      <p className="text-sm text-wizard-text-muted text-center">
                        Complete your order to unlock the full document
                      </p>
                    </div>
                  </div>

                  <div className="absolute inset-0" />
                </>
              ) : (
                <div className="flex items-center justify-center py-32">
                  <p className="text-wizard-text-muted">
                    Preview not available
                  </p>
                </div>
              )}
            </div>

            <div className="bg-wizard-bg/50 px-6 md:px-8 py-4 border-t border-wizard-border flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-wizard-text-muted">
                <FileText className="w-4 h-4" />
                <span>Fully editable DOCX format</span>
              </div>
              <div className="text-sm text-wizard-text-muted">
                Generated for NAICS {naicsCode}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => navigate("/app/step-2")}
          className="px-8"
        >
          Back
        </Button>
        <Button
          onClick={() => navigate("/app/step-4")}
          disabled={!tocGenerated}
          size="lg"
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step3;