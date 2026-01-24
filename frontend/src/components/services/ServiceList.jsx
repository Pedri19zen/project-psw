import { useState, useEffect } from "react";
// Use the configured API instead of raw axios (This ensures Headers/Auth work)
import api from "../../services/api";
import styles from "./ServiceList.module.css";
import { useNavigate } from "react-router-dom";

const ServiceList = () => {
	const navigate = useNavigate();
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch services
	useEffect(() => {
		const fetchServices = async () => {
			try {
				// Changed to 'api.get' to use the correct Base URL automatically
				const response = await api.get("/services");
				setServices(response.data);
				setLoading(false);
			} catch (err) {
				console.error(err);
				setError("Failed to load services.");
				setLoading(false);
			}
		};

		fetchServices();
	}, []);

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this service?")) {
			try {
				await api.delete(`/services/${id}`);
				setServices(services.filter((service) => service._id !== id));
			} catch (err) {
				alert("Error deleting service");
			}
		}
	};

	if (loading)
		return (
			<div className="fade-in" style={{ padding: "2rem" }}>
				Loading services...
			</div>
		);
	if (error)
		return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h2>Service Catalog</h2>

				{/* --- FIX IS HERE --- */}
				{/* We removed {styles.addButton} and used "btn-primary" */}
				<button
					className="btn-primary"
					onClick={() => navigate("/admin/services/new")}>
					+ Add New Service
				</button>
			</div>

			<table className={styles.table}>
				<thead>
					<tr>
						<th>Service Name</th>
						<th>Type</th>
						<th>Duration</th>
						<th>Price</th>
						<th>Mechanics</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{services.map((service) => (
						<tr key={service._id}>
							<td>
								<strong>{service.name}</strong>
							</td>
							<td>
								<span className={styles.badge}>{service.type}</span>
							</td>
							<td>{service.duration} min</td>
							<td>{service.price}€</td>
							<td>
								<small className={styles.mechanicCount}>
									{service.authorizedMechanics?.length || 0} Staff
								</small>
							</td>
							<td className={styles.actions}>
								{/* Updated these buttons to use Global Styles too */}
								<button
									className="btn-primary"
									style={{
										marginRight: "8px",
										padding: "6px 12px",
										fontSize: "0.8rem",
									}}
									onClick={() => navigate(`/admin/services/${service._id}`)} // <--- THE FIX
								>
									Edit
								</button>

								<button
									className="delete" // Matches the Red button style in variables.css
									style={{ padding: "6px 12px", fontSize: "0.8rem" }}
									onClick={() => handleDelete(service._id)}>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{services.length === 0 && (
				<div className={styles.emptyState}>
					No services found. Add one above!
				</div>
			)}
		</div>
	);
};

export default ServiceList;
