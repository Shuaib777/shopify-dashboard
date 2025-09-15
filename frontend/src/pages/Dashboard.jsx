import { useState, useEffect } from "react";
import {
  Box,
  Container,
  SimpleGrid,
  VStack,
  Spinner,
  Center,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import API_URL from "../config/apiConfig";

import Header from "../components/Header";
import Summary from "../components/Summary";
import OrderTrend from "../components/OrderTrend";
import Table from "../components/Table";
import OrderOverview from "../components/OrderOverview";

const Dashboard = () => {
  const [topCustomers, setTopCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [customersResponse, productsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/insight/top-customers`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}/api/insight/top-products`, {
            withCredentials: true,
          }),
        ]);

        if (customersResponse.data.success) {
          setTopCustomers(customersResponse.data.customers);
        }

        if (productsResponse.data.success) {
          setTopProducts(productsResponse.data.products);
        }
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <Box minH="100vh">
      <Header />
      <Container maxW="container.xl" py={6}>
        <VStack spacing={8} align="stretch">
          <Summary />
          <OrderOverview />
          <OrderTrend />
          <Table title={"TOP 5 ORDERS"} tableData={topCustomers} />
          <Table title={"TOP 5 PRODUCTS"} tableData={topProducts} />
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;
