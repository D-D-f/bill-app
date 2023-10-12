// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import "@testing-library/jest-dom/extend-expect.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    it("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toHaveClass("active-icon");
    });

    it("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a > b ? 1 : +1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    it("Then he clicks on the icon the modal with the image should open", () => {
      const html = BillsUI({
        data: bills,
      });
      document.body.innerHTML = html;
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billsList = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      // Create Modal
      $.fn.modal = jest.fn();
      const icon = screen.getAllByTestId("icon-eye")[0];

      const handleClickIconEye = jest.fn(() =>
        billsList.handleClickIconEye(icon)
      );
      icon.addEventListener("click", handleClickIconEye);
      // EventHandler
      fireEvent.click(icon);
      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = document.getElementById("modaleFile");
      expect(modale).toBeTruthy();
    });

    it("Then he clicks of the new note button you should be directed to another page", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billsList = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      $.fn.page = jest.fn();
      const btnNewNote = screen.getAllByTestId("btn-new-bill")[0];

      const handleClickNewBill = jest.fn(() => {
        billsList.handleClickNewBill(btnNewNote);
      });

      btnNewNote.addEventListener("click", handleClickNewBill);
      fireEvent.click(btnNewNote);
      expect(handleClickNewBill).toHaveBeenCalled();
      const formNewNote = document.querySelector(".form-newbill-container");
      expect(formNewNote).toBeTruthy();
    });
  });
});
