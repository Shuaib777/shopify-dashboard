import Header from "../components/Header";
import Summary from "../components/Summary";
import OrderTrend from "../components/OrderTrend";
import RevenueTrend from "../components/RevenueTrend";
import Table from "../components/Table";
import { Box, Container, SimpleGrid, VStack } from "@chakra-ui/react";

const Dashboard = () => {
  return (
    <Box minH="100vh">
      <Header />
      <Container maxW="container.xl" py={6}>
        <VStack spacing={8} align="stretch">
          <Summary />
          <OrderTrend />
          <RevenueTrend />
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Table type="customers" title="Top 5 Customers" />
            <Table type="products" title="Top 5 Products" />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;
