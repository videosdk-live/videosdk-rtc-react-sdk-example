import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor, Tracer } from "@opentelemetry/sdk-trace-base";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import opentelemetry, { Span, ROOT_CONTEXT } from "@opentelemetry/api";
import { Resource } from "@opentelemetry/resources";

export default class VideoSDKTelemetry {
  static tracer;

  static rootSpan;

  static init(peerId) {
    const exporter = new OTLPTraceExporter({
      url: "http://192.168.0.185:4318/v1/traces",
      headers: {
        anyHeader: "anyValue",
      },
    });
    const provider = new WebTracerProvider({
      resource: new Resource({
        "service.name": "react-sdk-example",
      }),
    });

    VideoSDKTelemetry.tracer = provider.getTracer(peerId);

    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register({
      contextManager: new ZoneContextManager(),
      // Zone is required to keep async calls in the same trace
    });

    VideoSDKTelemetry.rootSpan = VideoSDKTelemetry.tracer.startSpan(
      `peer_${peerId}`,
      {},
      ROOT_CONTEXT
    );

    /**
     * Terminating rootSpan immediately to have a holder span for current peer
     */
    VideoSDKTelemetry.rootSpan.end();
  }

  static trace(spanName) {
    const immmediateParentSpan = VideoSDKTelemetry.getCurrentSpan();

    const ctx = opentelemetry.trace.setSpan(ROOT_CONTEXT, immmediateParentSpan);

    VideoSDKTelemetry.tracer.startActiveSpan(spanName, {}, ctx, (span) => {
      span.setAttributes({
        [SemanticAttributes.CODE_FUNCTION]: spanName,
      });

      span.end();
    });
  }

  static getCurrentSpan() {
    let immmediateParentSpan = opentelemetry.trace.getSpan(
      opentelemetry.context.active()
    );

    immmediateParentSpan ??= VideoSDKTelemetry.rootSpan;
    return immmediateParentSpan;
  }

  static getCurrentSpanName() {
    return this.getCurrentSpan()?.name;
  }
}
