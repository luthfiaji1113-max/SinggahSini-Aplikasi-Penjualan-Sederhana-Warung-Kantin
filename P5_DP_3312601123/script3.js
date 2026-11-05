const ctx = document.getElementById('studentChart').getContext('2d');
const data = {
  labels: ['2019', '2020', '2021', '2022', '2023'], // Tahun
  datasets: [{
    label: 'Jumlah Mahasiswa',
    data: [200, 250, 300, 350, 400], // Data jumlah mahasiswa
    backgroundColor: [
      'rgba(54, 162, 235, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 99, 132, 0.2)'
    ],
    borderColor: [
      'rgba(54, 162, 235, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 99, 132, 1)'
    ],
    borderWidth: 1
  }]
};
const options = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
// Membuat grafik menggunakan Chart.js
const studentChart = new Chart(ctx, {
  type: 'bar', // Jenis grafik: batang (bar)
  data: data,
  options: options
});