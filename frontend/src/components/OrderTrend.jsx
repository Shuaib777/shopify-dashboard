import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Text,
  Button,
  ButtonGroup,
  useColorModeValue,
  Skeleton,
  VStack,
} from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { format, subDays, subYears } from "date-fns";

import axios from "axios";
import API_URL from "../config/apiConfig";
import { FaExclamationTriangle } from "react-icons/fa";
import { mockData } from "../util/mockOrders";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const OrderTrend = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");

  const textColor = useColorModeValue("gray.400", "white");
  const gridColor = useColorModeValue("white", "rgba(255, 255, 255, 0.1)");
  const tooltipBg = useColorModeValue("white", "#1A1B3A");
  const headingColor = useColorModeValue("gray.800", "white");

  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      let startDate;

      switch (timeRange) {
        case "90d":
          startDate = subDays(endDate, 90);
          break;
        case "1y":
          startDate = subYears(endDate, 1);
          break;
        default:
          startDate = subDays(endDate, 30);
          break;
      }

      const params = {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      };

      try {
        // const response = await axios.get(
        //   `${API_URL}/api/insight/orders-trend`,
        //   {
        //     params,
        //     withCredentials: true,
        //   }
        // );
        // const data = response.data;
        const data = mockData;
        console.log(data);

        if (data && data.success) {
          const trends = data.trends;
          const sortedDates = Object.keys(trends).sort(
            (a, b) => new Date(a) - new Date(b)
          );

          const labels = sortedDates.map((date) =>
            format(new Date(date), "MMM d")
          );
          const ordersData = sortedDates.map(
            (date) => trends[date].totalOrders
          );
          const revenueData = sortedDates.map(
            (date) => trends[date].totalRevenue
          );

          setChartData({ labels, ordersData, revenueData });
        } else {
          throw new Error("Failed to fetch valid trend data");
        }
      } catch (err) {
        setError("Could not load chart data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [timeRange]);

  const data = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: "Total Revenue",
        data: chartData?.revenueData || [],
        borderColor: "#885FFC",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(136, 95, 252, 0.5)");
          gradient.addColorStop(1, "rgba(136, 95, 252, 0)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#885FFC",
        yAxisID: "y1",
      },
      {
        label: "Total Orders",
        data: chartData?.ordersData || [],
        borderColor: "#01E5F2",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(1, 229, 242, 0.5)");
          gradient.addColorStop(1, "rgba(1, 229, 242, 0)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#01E5F2",
        yAxisID: "y",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: headingColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        position: "left",
        ticks: { color: textColor },
        grid: {
          color: gridColor,
          borderDash: [5, 5],
        },
        border: {
          display: false,
        },
      },
      y1: {
        position: "right",
        ticks: { color: textColor },
        grid: {
          drawOnChartArea: false,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Box>
            <Heading size="md" color={headingColor}>
              Orders Trend
            </Heading>
            <Text fontSize="sm" color="green.400">
              (+5%) more in 2025
            </Text>
          </Box>
          <ButtonGroup isAttached size="sm" variant="outline">
            <Button
              isActive={timeRange === "30d"}
              onClick={() => setTimeRange("30d")}
            >
              30 Days
            </Button>
            <Button
              isActive={timeRange === "90d"}
              onClick={() => setTimeRange("90d")}
            >
              90 Days
            </Button>
            <Button
              isActive={timeRange === "1y"}
              onClick={() => setTimeRange("1y")}
            >
              1 Year
            </Button>
          </ButtonGroup>
        </HStack>
      </CardHeader>
      <CardBody>
        <Box h="350px">
          {loading ? (
            <Skeleton height="100%" borderRadius="md" />
          ) : error ? (
            <VStack justify="center" h="100%" color="red.400" spacing={4}>
              <FaExclamationTriangle size="2em" />
              <Text fontWeight="bold" fontSize="lg">
                {error}
              </Text>
            </VStack>
          ) : (
            <Line options={options} data={data} />
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default OrderTrend;
