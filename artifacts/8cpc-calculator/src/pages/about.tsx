import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CalendarDays, Scale, FileText, CheckCircle2 } from "lucide-react";

export default function About() {
  const timeline = [
    { date: "Jan 16, 2025", event: "Constitution of 8th CPC", icon: FileText, done: true },
    { date: "Jan 1, 2026", event: "Effective Date of Implementation", icon: CalendarDays, done: false },
    { date: "Late 2026 / Early 2027", event: "Expected Submission of Report", icon: FileText, done: false },
    { date: "2027", event: "Expected Physical Payouts & Arrears", icon: CheckCircle2, done: false },
  ];

  const faqs = [
    {
      q: "What is a Fitment Factor?",
      a: "The fitment factor is a multiplication number used to arrive at the revised basic pay from the old basic pay. For the 7th CPC, it was 2.57. For the 8th CPC, unions are demanding between 2.86 and 3.83, while baseline expectations hover around 2.57 or lower."
    },
    {
      q: "What happens to Dearness Allowance (DA)?",
      a: "When a new pay commission is implemented, the existing DA (which would be around 60% by Jan 2026) is merged into the new basic pay. The DA counter resets to 0%."
    },
    {
      q: "Will HRA and TA decrease?",
      a: "No, the overall amount usually increases because it is calculated on a much higher basic pay. However, the percentage rates for HRA reset back to base levels (24%, 16%, 8% for X, Y, Z cities respectively) because the DA has been reset to 0%."
    },
    {
      q: "Who does the 8th CPC apply to?",
      a: "It applies to all Central Government civilian employees, including railway employees, civilian defence employees, and pensioners."
    },
    {
      q: "Are arrears taxable?",
      a: "Yes, arrears are taxable in the year you receive them. However, you can file Form 10E to claim relief under Section 89(1), which allows you to spread the tax burden across the years the arrears actually belong to."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">About the 8th Pay Commission</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything you need to know about the upcoming salary revision for Central Government employees.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              What is the 8th CPC?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The Central Pay Commission (CPC) is periodically constituted by the Government of India to review and revise the salary structure of its employees.
            </p>
            <p>
              The 8th CPC was officially constituted on January 16, 2025. It will review principles governing the emoluments structure, including pay, allowances, and other facilities/benefits for Central Government employees.
            </p>
            <p>
              Like previous commissions, it aims to adjust salaries against inflation and maintain parity with changing economic realities.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-slate-50 dark:bg-slate-900 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Expected Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {timeline.map((item, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${item.done ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-4 rounded border shadow-sm">
                    <div className="font-bold text-primary mb-1">{item.date}</div>
                    <div className="text-sm text-muted-foreground">{item.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-medium hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
