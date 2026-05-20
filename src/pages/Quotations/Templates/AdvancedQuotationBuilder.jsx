import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LayoutTemplate } from "lucide-react";
import BuilderSidebar from "./components/BuilderSidebar";
import A4Preview from "./components/A4Preview";
import { DEFAULT_TEMPLATE } from "./constants";
import { useAuth } from "../../../context/AuthContext";

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
      {text && (
        <span className={textClassName || "min-w-0 break-words text-[10px] font-black leading-tight"}>
          {text}
        </span>
      )}
    </span>
  );
};

export default function AdvancedQuotationBuilder({ templateId, onBack }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
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
        financials:
          fetchedTemplate.sections?.financials || DEFAULT_TEMPLATE.financials,
        terms: {
          title:
            fetchedTemplate.sections?.terms?.title || DEFAULT_TEMPLATE.terms.title,
          text: fetchedTemplate.defaultTerms || DEFAULT_TEMPLATE.terms.text,
        },
        signatures:
          fetchedTemplate.sections?.signatures || DEFAULT_TEMPLATE.signatures,
        pageStyle:
          fetchedTemplate.sections?.pageStyle || DEFAULT_TEMPLATE.pageStyle,
      });
    }
  }, [fetchedTemplate]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (templateId) {
        return await api.put(`/quotation-templates/${templateId}`, payload);
      }
      return await api.post("/quotation-templates", payload);
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
        pageStyle: template.pageStyle,
      },
      options: template.table,
      defaultTerms: template.terms.text,
      employeeId: user?.id,
    };

    saveMutation.mutate(payload);
  };

  if (isFetching) {
    return (
      <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#d8b46a]/35 bg-white shadow-[0_10px_24px_rgba(18,63,89,0.10)]">
            <IconWithText icon={Loader2} iconClassName="h-6 w-6 animate-spin text-[#123f59]" />
          </div>
          <p className="text-xs font-black text-[#123f59]">
            جاري تحميل النموذج...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 w-full overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-[Tajawal]"
      dir="rtl"
    >
      <BuilderSidebar
        template={template}
        setTemplate={setTemplate}
        handleSaveTemplate={handleSaveTemplate}
        isSaving={saveMutation.isPending}
        templateId={templateId}
        onBack={onBack}
      />

      <section className="min-w-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 flex-col">
<A4Preview template={template} setTemplate={setTemplate} />
        </div>
      </section>
    </div>
  );
}
