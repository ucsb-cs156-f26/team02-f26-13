import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";

import RestaurantsIndexPage from "main/pages/Restaurants/RestaurantsIndexPage";
import RestaurantsCreatePage from "main/pages/Restaurants/RestaurantsCreatePage";
import RestaurantsEditPage from "main/pages/Restaurants/RestaurantsEditPage";

import UCSBDatesIndexPage from "main/pages/UCSBDates/UCSBDatesIndexPage";
import UCSBDatesCreatePage from "main/pages/UCSBDates/UCSBDatesCreatePage";
import UCSBDatesEditPage from "main/pages/UCSBDates/UCSBDatesEditPage";

import PlaceholderIndexPage from "main/pages/Placeholder/PlaceholderIndexPage";
import PlaceholderCreatePage from "main/pages/Placeholder/PlaceholderCreatePage";
import PlaceholderEditPage from "main/pages/Placeholder/PlaceholderEditPage";

import UCSBDiningCommonsMenuItemIndexPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemIndexPage";
import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";
import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";

import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

import MenuItemReviewIndexPage from "main/pages/MenuItemReview/MenuItemReviewIndexPage";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";


export default function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        {currentUser && currentUser.loggedIn && (
          <>
            <Route exact path="/profile" element={<ProfilePage />} />
          </>
        )}
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route exact path="/admin/users" element={<AdminUsersPage />} />
          </>
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route
              exact
              path="/restaurants"
              element={<RestaurantsIndexPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route
              exact
              path="/restaurants/create"
              element={<RestaurantsCreatePage />}
            />
            <Route
              exact
              path="/restaurants/edit/:id"
              element={<RestaurantsEditPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route exact path="/ucsbdates" element={<UCSBDatesIndexPage />} />
          </>
        )}
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route
              exact
              path="/ucsbdates/create"
              element={<UCSBDatesCreatePage />}
            />
            <Route
              exact
              path="/ucsbdates/edit/:id"
              element={<UCSBDatesEditPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route
              exact
              path="/placeholder"
              element={<PlaceholderIndexPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route
              exact
              path="/placeholder/create"
              element={<PlaceholderCreatePage />}
            />
            <Route
              exact
              path="/placeholder/edit/:id"
              element={<PlaceholderEditPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route
              exact
              path="/diningcommonsmenuitem"
              element={<UCSBDiningCommonsMenuItemIndexPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route
              exact
              path="/diningcommonsmenuitem/create"
              element={<UCSBDiningCommonsMenuItemCreatePage />}
            />
            <Route
              exact
              path="/diningcommonsmenuitem/edit/:id"
              element={<UCSBDiningCommonsMenuItemEditPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route
              exact
              path="/menuitemreview"
              element={<MenuItemReviewIndexPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route
              exact
              path="/menuitemreview/create"
              element={<MenuItemReviewCreatePage />}
            />
            <Route
              exact
              path="/menuitemreview/edit/:id"
              element={<MenuItemReviewEditPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route
              exact
              path="/helprequest"
              element={<HelpRequestIndexPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route
              exact
              path="/helprequest/create"
              element={<HelpRequestCreatePage />}
            />
            <Route
              exact
              path="/helprequest/edit/:id"
              element={<HelpRequestEditPage />}
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}