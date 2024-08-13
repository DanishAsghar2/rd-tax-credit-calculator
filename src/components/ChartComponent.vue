<template>
  <div>
    <canvas id="expense-chart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';

// Register the necessary components (like PieController)
Chart.register(...registerables);

export default {
  props: ['expenses'],
  mounted() {
    new Chart(document.getElementById('expense-chart'), {
      type: 'pie',  // Specify the type of chart
      data: {
        labels: this.expenses.map(exp => exp.type),
        datasets: [{
          data: this.expenses.map(exp => exp.amount),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        }
      }
    });
  },
};
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
