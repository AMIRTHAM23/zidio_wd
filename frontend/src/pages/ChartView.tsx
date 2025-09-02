import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const ChartView = () => {
  const { id } = useParams();
  const { charts, uploads } = useData();

  // ✅ Support both id and _id
  const chart = charts.find((c) => c.id === id || c._id === id);

  if (!chart) {
    return <p className="p-6">❌ Chart not found</p>;
  }

  // ✅ Find matching upload
  const upload = uploads.find((u) => u.id === chart.uploadId || u._id === chart.uploadId);

  if (!upload || !upload.data) {
    return <p className="p-6">❌ Data for this chart not found</p>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{chart.title}</CardTitle>
          <CardDescription>
            {chart.type} chart created on{" "}
            {format(new Date(chart.createdAt), "MMM dd, yyyy HH:mm")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            X-Axis: <strong>{chart.xAxis}</strong> | Y-Axis: <strong>{chart.yAxis}</strong>
          </p>

          {/* Chart rendering */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={upload.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chart.xAxis} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={chart.yAxis} fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartView;
