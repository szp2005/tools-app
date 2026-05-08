"use client";

import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type PdfOrientation = "landscape" | "portrait";

type PdfTool = {
  id: string;
  name: string;
  source_site: string;
  source_url: string;
};

type PdfMatrixRow = {
  dimension: string;
  values: string[];
};

type PdfComparison = {
  tools: PdfTool[];
  matrix: PdfMatrixRow[];
};

type ComparisonPDFDocumentProps = {
  comparison: PdfComparison;
  orientation: PdfOrientation;
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontFamily: "Helvetica",
    padding: 28,
  },
  pagePortrait: {
    padding: 24,
  },
  eyebrow: {
    color: "#64748b",
    fontSize: 8,
    letterSpacing: 0,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 8,
  },
  subtitle: {
    color: "#475569",
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 18,
  },
  table: {
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
    borderLeftColor: "#e2e8f0",
    borderLeftWidth: 1,
    borderStyle: "solid",
    borderTopColor: "#e2e8f0",
    borderTopWidth: 1,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    minHeight: 42,
  },
  headerRow: {
    backgroundColor: "#f8fafc",
  },
  dimensionCell: {
    borderRightColor: "#e2e8f0",
    borderRightWidth: 1,
    borderStyle: "solid",
    padding: 8,
    width: 92,
  },
  valueCell: {
    borderRightColor: "#e2e8f0",
    borderRightWidth: 1,
    borderStyle: "solid",
    flex: 1,
    padding: 8,
  },
  cellBorderBottom: {
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
    borderStyle: "solid",
  },
  headerText: {
    color: "#0f172a",
    fontSize: 8.5,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  linkText: {
    color: "#4f46e5",
    textDecoration: "none",
  },
  labelText: {
    color: "#334155",
    fontSize: 8,
    fontWeight: 700,
    lineHeight: 1.4,
  },
  valueText: {
    color: "#475569",
    fontSize: 8,
    lineHeight: 1.45,
  },
  footer: {
    borderTopColor: "#e2e8f0",
    borderTopWidth: 1,
    color: "#64748b",
    fontSize: 8,
    marginTop: 18,
    paddingTop: 10,
  },
});

export function ComparisonPDFDocument({ comparison, orientation }: ComparisonPDFDocumentProps) {
  return (
    <Document title="AI Tool Comparison" author="Tools App">
      <Page
        size="A4"
        orientation={orientation}
        style={orientation === "portrait" ? [styles.page, styles.pagePortrait] : styles.page}
      >
        <Text style={styles.eyebrow}>Tools App comparison</Text>
        <Text style={styles.title}>AI Tool Comparison</Text>
        <Text style={styles.subtitle}>
          Generated from the Tools App four-site content index. Source links are included in the tool headers.
        </Text>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow, styles.cellBorderBottom]} fixed>
            <View style={styles.dimensionCell}>
              <Text style={styles.headerText}>Dimension</Text>
            </View>
            {comparison.tools.map((tool) => (
              <View key={tool.id} style={styles.valueCell}>
                <Link src={tool.source_url} style={[styles.headerText, styles.linkText]}>
                  {tool.name}
                </Link>
                <Text style={[styles.valueText, { marginTop: 4 }]}>{tool.source_site}</Text>
              </View>
            ))}
          </View>

          {comparison.matrix.map((row, rowIndex) => (
            <View
              key={row.dimension}
              style={rowIndex < comparison.matrix.length - 1 ? [styles.row, styles.cellBorderBottom] : styles.row}
              wrap={false}
            >
              <View style={styles.dimensionCell}>
                <Text style={styles.labelText}>{row.dimension}</Text>
              </View>
              {row.values.map((value, valueIndex) => (
                <View key={`${row.dimension}-${comparison.tools[valueIndex]?.id ?? valueIndex}`} style={styles.valueCell}>
                  <Text style={styles.valueText}>{value}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>tools.toolrouteai.com/comparison</Text>
      </Page>
    </Document>
  );
}

export default ComparisonPDFDocument;
