"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";

interface OrderStatusProps {
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

const STEPS = [
  { key: "pending", label: "Order Placed", description: "Your order has been received" },
  { key: "confirmed", label: "Confirmed", description: "Order confirmed and processing" },
  { key: "shipped", label: "Shipped", description: "On the way to you" },
  { key: "delivered", label: "Delivered", description: "Order delivered" },
];

export function OrderStatus({ status }: OrderStatusProps) {
  const currentStepIndex = STEPS.findIndex((step) => step.key === status);

  const isStepComplete = (stepIndex: number) => stepIndex < currentStepIndex;
  const isCurrentStep = (stepIndex: number) => stepIndex === currentStepIndex;

  return (
    <div className="w-full">
      {/* Desktop Timeline */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center w-full">
                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`absolute top-6 left-[calc(50%+20px)] right-[-50%] h-1 ${
                      isStepComplete(index + 1)
                        ? "bg-green-500"
                        : isCurrentStep(index)
                        ? "bg-gradient-to-r from-green-500 to-gray-300"
                        : "bg-gray-300"
                    }`}
                  />
                )}

                {/* Circle Icon */}
                <div className="relative z-10 mb-4">
                  {isStepComplete(index) ? (
                    <div className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  ) : isCurrentStep(index) ? (
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full animate-pulse">
                      <Clock className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-200 text-gray-400 rounded-full">
                      <Circle className="w-7 h-7" />
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="text-center">
                  <h4
                    className={`font-semibold text-sm ${
                      isStepComplete(index)
                        ? "text-green-600"
                        : isCurrentStep(index)
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Timeline (Vertical) */}
      <div className="md:hidden space-y-4">
        {STEPS.map((step, index) => (
          <div key={step.key} className="flex gap-4">
            {/* Circle and connector */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {isStepComplete(index) ? (
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : isCurrentStep(index) ? (
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full animate-pulse">
                    <Clock className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-400 rounded-full">
                    <Circle className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Vertical connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`w-1 h-8 mt-2 ${
                    isStepComplete(index + 1) ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>

            {/* Text */}
            <div className="pt-1 pb-4">
              <h4
                className={`font-semibold text-sm ${
                  isStepComplete(index)
                    ? "text-green-600"
                    : isCurrentStep(index)
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </h4>
              <p className="text-xs text-gray-500 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
