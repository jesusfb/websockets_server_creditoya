import { transporter } from "../../lib/NodeMailer";
import LoanApplicationService from "../classes/LoanApplicationServices";
import createEmailTemplate from "../components/TemplateMail";
import { io } from "../server";
import { ScalarLoanApplication, Status } from "../types/User";
import axios from "axios";

interface Users {
  [key: string]: string;
}

let users: Users = {};

io.on("connection", (socket) => {
  console.log("a user connected", socket && socket.id);

  socket.on("userConnected", (userId) => {
    users[userId] = socket.id;
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    // Cuando el usuario se desconecta, elimina su entrada del registro
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });

  socket.on("connected", (data) => {
    console.log("Connected to the server", data);
    socket.emit("hello", "Hello from server");
  });

  socket.on("create_loan_request", async (data: ScalarLoanApplication) => {
    const response = await LoanApplicationService.create(data);
    console.log("data from client: ", response);

    if (response.id) {
      const response = await LoanApplicationService.getAll();
      console.log("all Loans: ");
      io.emit("updateLoan", response);
      console.log("Emitido");
    }
  });

  socket.on("changeState", async (data) => {
    const {
      userId,
      nameUser,
      emailUser,
      employeeId,
      loanApplicationId,
      state,
      reason,
    }: {
      userId: string;
      nameUser: string;
      emailUser: string;
      employeeId: string;
      loanApplicationId: string;
      state: Status;
      reason: string | null;
    } = data;

    console.log("from intra: ", data);

    const userSocketId = users[userId];

    const dataEventAccept = {
      name: "Solicitud de prestamo",
      userId,
      employeeId,
    };

    const dataEventRejected = {
      name: "Solicitud de prestamo",
      userId,
      reason,
      employeeId,
    };

    await LoanApplicationService.changeStatus(loanApplicationId, state).then(
      (result) => console.log(result)
    );

    await LoanApplicationService.fillEmployeeId(loanApplicationId, employeeId);

    if (state == "Rechazado") {
      io.emit("newEventReqLoans", dataEventRejected);
    }

    if (state == "Aprobado") {
      io.emit("newEventReqLoans", dataEventAccept);

      // Envio de correo electronico a cliente para avisar su aceptacion de prestamo
      await transporter
        .sendMail({
          from: `"Credito ya" ${process.env.GOOGLE_EMAIL} `,
          to: emailUser,
          subject: "Estado de prestamo",
          text: "¡Funciona!",
          html: createEmailTemplate({ nameUser, loanApplicationId }),
        })
        .then((data) => console.log(data))
        .catch((error) => console.log(error));

      // Envio de datos actualizados al dashboard de espera de empleados y del cliente en especifico
      const response = await LoanApplicationService.getAll();

      io.emit("updateLoan", response);
      // io.emit("updateLoanClient", response);
    }
  });
});
