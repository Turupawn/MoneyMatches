import React from "react";
import { Box } from "rimble-ui";
import {
  PieChart, Pie, Cell,
} from 'recharts';


class BetChart extends React.Component {
  state = {
    data: [
      { name: this.props.player1_name, value: Number(this.props.player1_pot) },
      { name: this.props.player2_name, value: Number(this.props.player2_pot) }
    ],
    RADIAN: Math.PI / 180,
    renderCustomizedLabel: ({
      cx, cy, midAngle, innerRadius, outerRadius, percent, index,
    }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * this.state.RADIAN);
      const y = cy + radius * Math.sin(-midAngle * this.state.RADIAN);
    
      return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
          {`${(percent * 100).toFixed(0)}% ${this.state.data[index].name}`}
        </text>
      );
    },
    COLORS: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
  };

  render() {
    return (
      <Box>
        <PieChart width={450} height={450}>
          <Pie
            data={this.state.data}
            cx={200}
            cy={200}
            labelLine={false}
            label={this.state.renderCustomizedLabel}
            outerRadius={200}
            fill="#8884d8"
            dataKey="value"
          >
            {
              this.state.data.map((entry, index) => <Cell key={`cell-${index}`} fill={this.state.COLORS[index % this.state.COLORS.length]} />)
            }
          </Pie>
        </PieChart>
      </Box>
    );
  }
}

export default BetChart;