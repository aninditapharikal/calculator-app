import React, { Component } from "react";
import { Table } from "reactstrap";

class Data extends Component {
	render() {
		const data = this.props.data;
		let i = 1;
		return (
			<div>
				<Table striped>
					<thead>
						<tr>
							<th>
								10 Latest History
							</th>
						</tr>
					</thead>
						<tbody>
							{data.map((obj) => (
							<tr key={i}>
								<th key={i++}>{obj}</th>
							</tr>
						))}
					</tbody>
					
				</Table>
			</div>
		);
	}
}
export default Data;