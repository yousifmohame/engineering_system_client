import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import BuilderSidebar from "./components/BuilderSidebar";
import A4Preview from "./components/A4Preview";
import { DEFAULT_TEMPLATE } from "./constants";

export default function AdvancedQuotationBuilder({ templateId, onBack }) {
  const queryClient = useQueryClient();
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

  const { data: fetchedTemplate, isLoading: isFetching } = useQuery({
    queryKey: ["quotation-template", templateId],
    queryFn: async () => {
      const res = await api.get(`/quotation-templates/${templateId}`);
      return res.data.data;
    },
    enabled: !!templateId,
  });

  useEffect(() => {
    if (fetchedTemplate) {
      setTemplate({
        title: fetchedTemplate.title || DEFAULT_TEMPLATE.title,
        type: fetchedTemplate.type || DEFAULT_TEMPLATE.type,
        desc: fetchedTemplate.description || DEFAULT_TEMPLATE.desc,
        header: fetchedTemplate.sections?.header || DEFAULT_TEMPLATE.header,
        intro: fetchedTemplate.sections?.intro || DEFAULT_TEMPLATE.intro,
        table: fetchedTemplate.options || DEFAULT_TEMPLATE.table,
        financials: fetchedTemplate.sections?.financials || DEFAULT_TEMPLATE.financials,
        terms: {
          title: fetchedTemplate.sections?.terms?.title || DEFAULT_TEMPLATE.terms.title,
          text: fetchedTemplate.defaultTerms || DEFAULT_TEMPLATE.terms.text,
        },
        signatures: fetchedTemplate.sections?.signatures || DEFAULT_TEMPLATE.signatures,
      });
    }
  }, [fetchedTemplate]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if(templateId) {
          return await api.put(`/quotation-templates/${templateId}`, payload); // تعديل
      }
      return await api.post("/quotation-templates", payload); // إضافة
    },
    onSuccess: () => {
      toast.success("تم الحفظ بنجاح");
      queryClient.invalidateQueries(["quotation-templates"]);
      onBack();
    },
    onError: (err) => {
      toast.error("حدث خطأ: " + (err.response?.data?.message || err.message));
    },
  });

  const handleSaveTemplate = () => {
    const payload = {
      title: template.title,
      type: template.type,
      desc: template.desc,
      sections: {
        header: template.header,
        intro: template.intro,
        financials: template.financials,
        terms: { title: template.terms.title },
        signatures: template.signatures,
      },
      options: template.table,
      defaultTerms: template.terms.text,
    };
    saveMutation.mutate(payload);
  };

  if (isFetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white" dir="rtl">
      <BuilderSidebar 
        template={template} 
        setTemplate={setTemplate} 
        handleSaveTemplate={handleSaveTemplate}
        isSaving={saveMutation.isPending}
        templateId={templateId}
        onBack={onBack}
      />
      <A4Preview template={template} />
    </div>
  );
}