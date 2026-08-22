import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, Sparkles } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorId: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorId: "",
    };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorId: `err-${Date.now().toString(36)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log privacy-safe operational metadata only (no PII, no child data)
    console.warn(
      `[ErrorBoundary] Caught unexpected render error. Type=${error.name} Id=${this.state.errorId}`
    );
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorId: "" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-white flex items-center justify-center p-4 font-sans text-slate-800" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border-2 border-indigo-100 shadow-2xl text-center space-y-6">
            {/* Friendly Avatar & Icon */}
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg transform -rotate-3 text-5xl">
              🤖
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
                استراحة قصيرة
              </span>
              <h1 className="text-2xl font-black text-slate-900">
                عذراً يا بطل! حدث أمر غير متوقع
              </h1>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                لا تقلق، جميع تقدمك ونقاطك وإنجازاتك محفوظة بأمان! اضغط على الزر أدناه لنواصل رحلة الاستكشاف معاً.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={this.handleRetry}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-base"
              >
                <RefreshCw className="w-5 h-5" />
                <span>إعادة المحاولة والمتابعة 🚀</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
