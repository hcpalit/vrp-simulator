import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function calculateRouteCost(route, distances) {
  if (route.length === 0) return 0;
  let total = distances.depot[route[0]];
  for (let i = 0; i < route.length - 1; i++) {
    total += distances[route[i]][route[i + 1]];
  }
  total += distances[route[route.length - 1]].depot;
  return total;
}

export default function VRPSimulator() {
  const [customers, setCustomers] = useState([
    { id: 1, demand: 5 },
    { id: 2, demand: 3 },
    { id: 3, demand: 7 },
    { id: 4, demand: 4 },
    { id: 5, demand: 6 },
  ]);

  const [vehicles, setVehicles] = useState([
    { id: "V1", capacity: 10 },
    { id: "V2", capacity: 15 },
  ]);

  const [routes, setRoutes] = useState({ V1: [], V2: [] });
  const [totalCost, setTotalCost] = useState(0);
  const [newVehicleCapacity, setNewVehicleCapacity] = useState(10);
  const [newCustomerDemand, setNewCustomerDemand] = useState(5);

  const distances = {
    depot: Object.fromEntries(customers.map((c) => [c.id, Math.floor(Math.random() * 10) + 1])),
  };
  customers.forEach((c1) => {
    distances[c1.id] = {};
    customers.forEach((c2) => {
      if (c1.id !== c2.id) distances[c1.id][c2.id] = Math.floor(Math.random() * 10) + 1;
    });
    distances[c1.id].depot = distances.depot[c1.id];
  });

  const handleAssign = (vehicleId, customerId) => {
    if (routes[vehicleId].includes(customerId)) return;
    const newRoutes = { ...routes };
    newRoutes[vehicleId].push(customerId);
    setRoutes(newRoutes);
    recalculateTotalCost(newRoutes);
  };

  const getRemainingCapacity = (vehicleId) => {
    const used = routes[vehicleId]?.reduce(
      (acc, id) => acc + customers.find((c) => c.id === id).demand,
      0
    ) || 0;
    return vehicles.find((v) => v.id === vehicleId).capacity - used;
  };

  const addVehicle = () => {
    const newId = `V${vehicles.length + 1}`;
    setVehicles([...vehicles, { id: newId, capacity: newVehicleCapacity }]);
    setRoutes({ ...routes, [newId]: [] });
  };

  const addCustomer = () => {
    const newId = customers.length + 1;
    setCustomers([...customers, { id: newId, demand: newCustomerDemand }]);
  };

  const recalculateTotalCost = (newRoutes) => {
    let cost = 0;
    Object.entries(newRoutes).forEach(([vehicle, route]) => {
      cost += calculateRouteCost(route, distances);
    });
    setTotalCost(cost);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">VRP Simulator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {vehicles.map((v) => (
          <Card key={v.id} className="bg-white shadow">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">
                {v.id} (Capacity: {v.capacity}, Remaining: {getRemainingCapacity(v.id)})
              </h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {customers.map((c) => (
                  <Button
                    key={c.id}
                    disabled={
                      routes[v.id]?.includes(c.id) ||
                      c.demand > getRemainingCapacity(v.id)
                    }
                    onClick={() => handleAssign(v.id, c.id)}
                  >
                    Add C{c.id} (D: {c.demand})
                  </Button>
                ))}
              </div>
              <p>Route: Depot → {routes[v.id]?.join(" → ")} → Depot</p>
              <p>Cost: {calculateRouteCost(routes[v.id] || [], distances)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold">Add New Vehicle</h3>
        <div className="flex gap-2 mb-2">
          <Input
            type="number"
            value={newVehicleCapacity}
            onChange={(e) => setNewVehicleCapacity(parseInt(e.target.value))}
          />
          <Button onClick={addVehicle}>Add Vehicle</Button>
        </div>

        <h3 className="font-semibold">Add New Customer</h3>
        <div className="flex gap-2">
          <Input
            type="number"
            value={newCustomerDemand}
            onChange={(e) => setNewCustomerDemand(parseInt(e.target.value))}
          />
          <Button onClick={addCustomer}>Add Customer</Button>
        </div>
      </div>

      <div className="mt-6 text-xl font-semibold">
        Total Cost: {totalCost}
      </div>
    </div>
  );
}
